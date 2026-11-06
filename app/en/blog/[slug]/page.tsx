import BlogDetail from '../../../../src/views/BlogDetail';
import { guardMenu } from '../../../../src/lib/menu-guard';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await guardMenu('blog');
  return <BlogDetail slug={slug} />;
}
