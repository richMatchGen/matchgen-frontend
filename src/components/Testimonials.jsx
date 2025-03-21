import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/system';

const userTestimonials = [
  {
    avatar: <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />,
    name: 'Remy Sharp',
    occupation: 'Senior Engineer',
    testimonial:
      "I absolutely love how versatile this product is! Whether I'm tackling work projects or indulging in my favorite hobbies, it seamlessly adapts to my changing needs.",
  },
  {
    avatar: <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />,
    name: 'Travis Howard',
    occupation: 'Lead Product Designer',
    testimonial:
      "One of the standout features of this product is the exceptional customer support. The team behind it has been quick to respond and incredibly helpful.",
  },
  {
    avatar: <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />,
    name: 'Cindy Baker',
    occupation: 'CTO',
    testimonial:
      'The level of simplicity and user-friendliness in this product has significantly simplified my life.',
  },
];

const logoStyle = {
  width: '64px',
  opacity: 0.3,
};

export default function Testimonials() {
  const theme = useTheme();

  return (
    <Container id="testimonials" sx={{ pt: { xs: 4, sm: 12 }, pb: { xs: 8, sm: 16 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 3, sm: 6 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' }, textAlign: { sm: 'left', md: 'center' } }}>
        <Typography component="h2" variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
          Testimonials
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          See what our customers love about our products.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {userTestimonials.map((testimonial, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <CardContent>
                <Typography variant="body1" gutterBottom sx={{ color: 'text.secondary' }}>
                  {testimonial.testimonial}
                </Typography>
              </CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <CardHeader avatar={testimonial.avatar} title={testimonial.name} subheader={testimonial.occupation} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
