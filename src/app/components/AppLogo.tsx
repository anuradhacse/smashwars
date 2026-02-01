import { SvgIcon, type SvgIconProps } from '@mui/material';

export function RacketIcon(props: SvgIconProps) {
  return (
    <SvgIcon
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 3.5c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6Z" />
      <path d="m11 13.9-5.3 5.3a2.1 2.1 0 0 0 3 3l5.3-5.3" />
      <circle cx="16.2" cy="6.8" r="1" />
    </SvgIcon>
  );
}
