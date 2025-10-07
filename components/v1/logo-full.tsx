import Image from 'next/image';
import Link from 'next/link';

const LogoFull = () => {
  return (
    <Link href={'/'} className="flex items-center gap-3 text-lg font-bold">
      <Image
        src="/images/logo.png"
        alt="logo"
        width={1000000000}
        height={1000000000}
        quality={100}
        className="h-10 w-32"
      />
      {/* <span>Tourillo Admin</span> */}
    </Link>
  );
};

export default LogoFull;
