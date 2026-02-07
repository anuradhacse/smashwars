import {
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  type TooltipProps,
} from 'recharts';
import { useState } from 'react';
import ShowChartIcon from '@mui/icons-material/ShowChart';

interface DataPoint {
  date: string;
  rating: number;
  displayDate: string;
}

export function PointsChart() {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Generate historical rating data
  const allData: DataPoint[] = [
    { date: '2025-07-24', rating: 2056, displayDate: 'Jul 24' },
    { date: '2025-08-07', rating: 2048, displayDate: 'Aug 7' },
    { date: '2025-08-21', rating: 2063, displayDate: 'Aug 21' },
    { date: '2025-09-04', rating: 2078, displayDate: 'Sep 4' },
    { date: '2025-09-18', rating: 2071, displayDate: 'Sep 18' },
    { date: '2025-10-02', rating: 2089, displayDate: 'Oct 2' },
    { date: '2025-10-16', rating: 2095, displayDate: 'Oct 16' },
    { date: '2025-10-30', rating: 2103, displayDate: 'Oct 30' },
    { date: '2025-11-13', rating: 2098, displayDate: 'Nov 13' },
    { date: '2025-11-27', rating: 2112, displayDate: 'Nov 27' },
    { date: '2025-12-11', rating: 2107, displayDate: 'Dec 11' },
    { date: '2025-12-25', rating: 2119, displayDate: 'Dec 25' },
    { date: '2026-01-08', rating: 2129, displayDate: 'Jan 8' },
    { date: '2026-01-22', rating: 2145, displayDate: 'Jan 22' },
  ];

  const getFilteredData = () => {
    const now = new Date('2026-01-24');
    let cutoffDate = new Date(now);

    switch (timeRange) {
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return allData.filter((point) => new Date(point.date) >= cutoffDate);
  };

  const data = getFilteredData();
  const currentRating = data[data.length - 1]?.rating || 2145;
  const startRating = data[0]?.rating || 2056;
  const ratingChange = currentRating - startRating;
  const percentChange = ((ratingChange / startRating) * 100).toFixed(1);

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    const dataPoint = payload?.[0]?.payload as DataPoint | undefined;
    if (active && dataPoint) {
      return (
        <Box
          sx={{
            bgcolor: 'rgba(43, 41, 48, 0.98)',
            p: 1.5,
            border: 1,
            borderColor: 'rgba(208, 188, 255, 0.3)',
            borderRadius: 2,
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {dataPoint.displayDate}
          </Typography>
          <Typography variant="h6" color="primary" fontWeight={700}>
            {payload?.[0]?.value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', overflow: 'hidden' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ShowChartIcon sx={{ mr: 1, color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700}>
                Rating Progress
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant={isMobile ? 'h5' : 'h4'} color="primary" fontWeight={700}>
                {currentRating}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor:
                    ratingChange >= 0 ? 'rgba(166, 211, 136, 0.15)' : 'rgba(242, 184, 181, 0.15)',
                }}
              >
                <Typography
                  variant={isMobile ? 'body2' : 'body1'}
                  sx={{
                    color: ratingChange >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 700,
                  }}
                >
                  {ratingChange >= 0 ? '+' : ''}
                  {ratingChange} ({percentChange}%)
                </Typography>
              </Box>
            </Box>
          </Box>

          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setTimeRange(newValue);
              }
            }}
            size="small"
            sx={{
              bgcolor: 'background.default',
              '& .MuiToggleButton-root': {
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary',
                fontWeight: 600,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              },
            }}
          >
            <ToggleButton value="1M">1M</ToggleButton>
            <ToggleButton value="3M">3M</ToggleButton>
            <ToggleButton value="6M">6M</ToggleButton>
            <ToggleButton value="1Y">1Y</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <ResponsiveContainer width="100%" height={isMobile ? 250 : isTablet ? 280 : 320}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: isMobile ? 0 : 10, left: isMobile ? -20 : 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D0BCFF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D0BCFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(230, 225, 229, 0.1)" />
            <XAxis
              dataKey="displayDate"
              stroke="#CAC4D0"
              style={{ fontSize: isMobile ? '10px' : '12px' }}
              tick={{ fill: '#CAC4D0' }}
            />
            <YAxis
              domain={['dataMin - 20', 'dataMax + 20']}
              stroke="#CAC4D0"
              style={{ fontSize: isMobile ? '10px' : '12px' }}
              tick={{ fill: '#CAC4D0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="rating"
              stroke="#D0BCFF"
              strokeWidth={3}
              fill="url(#colorRating)"
              dot={{ fill: '#D0BCFF', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#D0BCFF', stroke: '#1C1B1F', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
