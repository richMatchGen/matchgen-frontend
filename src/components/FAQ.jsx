import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQ() {
  const [expanded, setExpanded] = React.useState([]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(
      isExpanded ? [...expanded, panel] : expanded.filter((p) => p !== panel)
    );
  };

  return (
    <Container
      id="faq"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        sx={{
          color: 'text.primary',
          width: { sm: '100%', md: '60%' },
          textAlign: { sm: 'left', md: 'center' },
        }}
      >
        Frequently asked questions
      </Typography>
      <Box sx={{ width: '100%' }}>
        {[
          {
            id: 'panel1',
            question: 'How do I contact customer support if I have a question or issue?',
            answer: (
              <>
                You can reach our customer support team by emailing&nbsp;
                <Link href="mailto:support@email.com">support@email.com</Link>
                &nbsp;or calling our toll-free number. We&apos;re here to assist you promptly.
              </>
            ),
          },
          {
            id: 'panel2',
            question: "Can I return the product if it doesn&apos;t meet my expectations?",
            answer: 'Absolutely! We offer a hassle-free return policy. If you&apos;re not completely satisfied, you can return the product within [number of days] days for a full refund or exchange.',
          },
          {
            id: 'panel3',
            question: 'What makes your product stand out from others in the market?',
            answer: 'Our product distinguishes itself through its adaptability, durability, and innovative features. We prioritize user satisfaction and continually strive to exceed expectations in every aspect.',
          },
          {
            id: 'panel4',
            question: 'Is there a warranty on the product, and what does it cover?',
            answer: 'Yes, our product comes with a [length of warranty] warranty. It covers defects in materials and workmanship. If you encounter any issues covered by the warranty, please contact our customer support for assistance.',
          },
        ].map(({ id, question, answer }) => (
          <Accordion key={id} expanded={expanded.includes(id)} onChange={handleChange(id)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${id}-content`} id={`${id}-header`}>
              <Typography component="span" variant="subtitle2">
                {question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" gutterBottom sx={{ maxWidth: { sm: '100%', md: '70%' } }}>
                {answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}
