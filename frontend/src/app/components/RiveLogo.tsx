import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useRive } from '@rive-app/react-canvas';
import { useTheme } from '@mui/material';

interface RiveLogoProps {
  src: string;
  size?: number;
}

export function RiveLogo({ src, size = 56 }: RiveLogoProps) {
  const theme = useTheme();
  const { RiveComponent } = useRive({
    src,
    autoplay: true,
  });

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 1,
        overflow: 'hidden',
        bgcolor:
          theme.palette.mode === 'light'
            ? alpha(theme.palette.success.light, 0.28)
            : theme.palette.background.paper,
      }}
      aria-label="Table tennis logo"
    >
      <RiveComponent />
    </Box>
  );
}
