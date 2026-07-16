'use client';

import Image from 'next/image';

export default function CachedImage(props:any){
 return <Image {...props} loading="lazy" />;
}
