import Projects from '../../../src/views/Projects';
import { guardMenu } from '../../../src/lib/menu-guard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await guardMenu('projects');
  return <Projects />;
}
