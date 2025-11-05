import Image from 'next/image';
import Link from 'next/link';

const LogoFull = () => {
  return (
    <Link href={'/'} className="flex items-center  text-lg font-bold">
      <Image src="/images/logo.png" alt="logo" width={1000000000} height={1000000000} quality={100} className="w-32" />
      </Link>
  );
};

export default LogoFull;
