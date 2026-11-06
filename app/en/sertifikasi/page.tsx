import Certifications from '../../../src/views/Certifications';
import { guardMenu } from '../../../src/lib/menu-guard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await guardMenu('sertifikasi');
  return <Certifications />;
}
