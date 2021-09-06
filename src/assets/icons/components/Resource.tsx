import * as React from 'react';

function SvgResource(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={12}
      height={11}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0 3.5s3.5-3 7.5-3 4.5 3 4.5 3"
        stroke="#fff"
        strokeOpacity={0.2}
      />
      <path
        d="M4.5 3.5c-4 0-4.5 3-4.5 3v2C1.5 7.667 3.5 6 7 6c2.5 0 4.167 1.667 5 2.5v-2s-3.5-3-7.5-3z"
        fill="currentColor"
      />
      <path
        d="M0 10.5s1.5-1 5.5-1 6.5 1 6.5 1"
        stroke="#fff"
        strokeOpacity={0.2}
      />
    </svg>
  );
}

export default SvgResource;
