#!/usr/bin/env python3
"""Compile and execute SDK docs against unpacked published packages.

Run from the docs root after npm install:
  python3 scripts/check-sdk-examples.py --typescript-package /path/to/npm/package \
    --python-package /path/to/unpacked/wheel

No service credentials or network access required. Framework middleware pages use the separate public/examples/vercel-ai-sdk
check and verifier; generic integration sketches remain excluded.
"""
import argparse
import ast
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--typescript-package', required=True, type=Path)
parser.add_argument('--python-package', required=True, type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
fixtures = root / 'scripts/sdk-docs-fixtures'
env = dict(os.environ, CAVE_BASE_URL='https://sdk.fixture.invalid', CAVE_API_KEY='fixture-key',
           CAVE_MODEL='fixture-model', CAVE_ANTHROPIC_MODEL='fixture-model',
           OPENAI_API_KEY='fixture-upstream', ANTHROPIC_API_KEY='fixture-upstream',
           CAVE_POLICY_PUBLIC_KEY='AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
           PYTHONPATH=str(args.python_package.resolve()))

def run(command):
    result = subprocess.run(command, env=env, cwd=root, text=True, capture_output=True)
    if result.returncode:
        raise SystemExit(f'Failed: {command}\n{result.stdout}\n{result.stderr}')

assert json.loads((args.typescript_package / 'package.json').read_text())['version'] == '1.1.0'
with tempfile.TemporaryDirectory(prefix='caveman-sdk-docs-') as directory:
    temp = Path(directory)
    module = temp / 'node_modules/@caveman-ai/sdk'
    module.parent.mkdir(parents=True)
    module.symlink_to(args.typescript_package.resolve(), target_is_directory=True)
    files = []
    executable = []
    count = 0
    for page in sorted((root / 'app/docs/sdk').rglob('page.mdx')):
        name = str(page.parent.relative_to(root / 'app/docs')).replace('/', '-')
        if name == 'sdk-middleware' or name.startswith('sdk-middleware-'):
            continue
        blocks = re.findall(r'^```(ts|js|python)\n(.*?)^```', page.read_text(), re.M | re.S)
        for language in ('ts', 'js', 'python'):
            selected = [code for lang, code in blocks if lang == language]
            if not selected:
                continue
            count += len(selected)
            code = '\n'.join(selected)
            if language == 'python':
                ast.parse(code, filename=str(page))
                prelude = 'import os, json, runpy\nimport caveman_cloud.core as core\nfrom caveman_cloud import Cave\n'
                prelude += f'fixture = runpy.run_path({str(fixtures / "http.py")!r})\ncore._urlopen = fixture["urlopen"]\n'
                prelude += 'cave = Cave(api_key=os.environ["CAVE_API_KEY"], base_url=os.environ["CAVE_BASE_URL"], agent="docs-test")\n'
                if name == 'sdk-tools':
                    code += '\nassert breaker._repeats == 4\nassert selected_tools[0] is catalog[0]\n'
                if name == 'sdk-compression':
                    code += '\nassert result.ratio == 0.75 and result.basis == "inferred"\n'
                    code += 'def unavailable(*args, **kwargs): raise OSError("fixture offline")\ncore._urlopen = unavailable\nfailed = cave.compress(original)\nassert failed.output == original and failed.recovery_handle is None and failed.ratio == 0\n'
                if name == 'sdk-policy':
                    code += '\nassert decision.decision == "baseline"\n'
                file = temp / (name + '.py'); file.write_text(prelude + code)
                run(['python3', str(file)])
            else:
                prelude = '' if language == 'js' else 'import { Cave } from "@caveman-ai/sdk";\nconst cave = new Cave({ apiKey: process.env.CAVE_API_KEY!, baseURL: process.env.CAVE_BASE_URL!, agent: "docs-test" });\n'
                if name == 'sdk-compression':
                    code += '\nif (result.ratio !== 0.75 || result.basis !== "inferred") throw new Error("Bad compression report");\n'
                    code += 'globalThis.fetch = async () => { throw new Error("fixture offline"); };\nconst failed = await cave.compress(original);\nif (failed.output !== original || failed.ratio !== 0 || failed.recoveryHandle !== undefined) throw new Error("Bad fallback");\n'
                if name == 'sdk-tools':
                    code += '\nif (selected.tools[0] !== catalog[0]) throw new Error("Lost local handler");\n'
                file = temp / (name + ('.mts' if language == 'ts' else '.mjs'))
                file.write_text(prelude + code)
                if language == 'ts': files.append(str(file))
                executable.append(file.with_suffix('.mjs'))
    run([str(root / 'node_modules/.bin/tsc'), '--module', 'NodeNext', '--moduleResolution', 'NodeNext',
         '--target', 'ES2022', '--lib', 'ES2023,DOM,DOM.Iterable,DOM.AsyncIterable', '--strict', '--skipLibCheck',
         '--types', 'node', '--typeRoots', str(root / 'node_modules/@types'), *files])
    for file in executable:
        run(['node', '--import', str(fixtures / 'http.mjs'), str(file)])
    print(f'PASS: {count} core documentation code blocks compiled/executed against published 1.1.0 packages; transport fixtures only.')
    print('Framework integration sketches excluded; no live provider or deployment certification.')
