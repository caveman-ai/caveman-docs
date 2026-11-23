#!/usr/bin/env python3
"""Run downloaded examples in provisioned isolated environments against a real runtime.

Provision dependencies as documented, including optional @ai-sdk/openai for tsc.
This runner never enables the paid-provider path.
"""
import argparse
import os
from pathlib import Path
import shutil
import subprocess

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--typescript-env',type=Path,required=True)
p.add_argument('--python-env',type=Path,required=True)
p.add_argument('--endpoint',default='http://127.0.0.1:8787')
a=p.parse_args()
root=Path(__file__).resolve().parents[1]
source=root/'public/examples/middleware'
shutil.copy(source/'quickstart.ts',a.typescript_env/'quickstart.ts')
shutil.copy(source/'quickstart.py',a.python_env/'quickstart.py')
env=dict(os.environ,CAVEMAN_ENDPOINT=a.endpoint,PAID_PROVIDER='0')
env.pop('OPENAI_API_KEY',None)
for mode in ['off','record','compress']:
 env['DEMO_MODE']=mode
 for language,command,cwd in [
  ('TypeScript',['node','--experimental-strip-types','quickstart.ts'],a.typescript_env),
  ('Python',[str(a.python_env.resolve()/'bin/python'),'quickstart.py'],a.python_env),
 ]:
  result=subprocess.run(command,cwd=cwd,env=env,text=True,capture_output=True,timeout=60)
  if result.returncode: raise SystemExit(result.stdout+result.stderr)
  print(f'PASS {language} {mode}: native loop, expected report, original history'+('; exact paginated recovery' if mode=='compress' else ''))
print('Local mechanism proof only; no provider quality or billing claim.')
