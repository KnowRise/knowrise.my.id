import Contact from '../../../src/views/Contact';
import { guardMenu } from '../../../src/lib/menu-guard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await guardMenu('contact');
  return <Contact />;
}
