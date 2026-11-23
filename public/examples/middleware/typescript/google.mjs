import { CavemanGoogleGenAI } from '@caveman-ai/middleware/google';
export async function run({ nativeOptions, model, contents, runtime, scope }) {
  await runtime.ready();
  const client = new CavemanGoogleGenAI(nativeOptions, { runtime, scope });
  return client.models.generateContent({ model, contents });
}
