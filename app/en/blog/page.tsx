import Blog from '../../../src/views/Blog';
import { guardMenu } from '../../../src/lib/menu-guard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await guardMenu('blog');
  return <Blog />;
}
