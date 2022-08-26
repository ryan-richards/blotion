import { extendTheme } from "@chakra-ui/react";
import { withProse } from '@nikolovlazar/chakra-ui-prose';
import colors from "./colors";
import Button from "./components/button";

const customTheme = extendTheme({
  fonts: {
    body: "Outfit, sans-serif",
    heading: "Outfit, sans-serif",
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  colors,
  components: {
    Button,
  },
  semanticTokens: {
    colors: {
      box: {
        default: 'gray.50',
        _dark: 'gray.700'
      },
      shadow: {
        default: 'none',
        _dark: 'md'
      }
    }
  }
}, withProse({
  baseStyle: {
    h1: {
      mt: { base: 4, md: 6 },
      mb: { base: 3, md: 4 }
    },
    h2: {
      mt: { base: 4, md: 6 },
      mb: { base: 3, md: 4 }
    },
    h3: {
      mt: { base: 2, md: 3 },
      mb: { base: 3, md: 4 }
    },
    iframe: {
      width: 'full',
      minHeight: '400px'
    }
  }
}));

export default customTheme;
