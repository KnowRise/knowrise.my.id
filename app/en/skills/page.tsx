import Skills from '../../../src/views/Skills';
import { guardMenu } from '../../../src/lib/menu-guard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await guardMenu('skills');
  return <Skills />;
}
