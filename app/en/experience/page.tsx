import Experience from '../../../src/views/Experience';
import { guardMenu } from '../../../src/lib/menu-guard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await guardMenu('experience');
  return <Experience />;
}
