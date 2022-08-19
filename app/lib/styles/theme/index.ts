import { extendTheme } from "@chakra-ui/react";
import { withProse } from '@nikolovlazar/chakra-ui-prose';
import colors from "./colors";
import Button from "./components/button";
import fonts from "./fonts";

const customTheme = extendTheme({
  fonts,
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
    h2: {
      mb: { base: 3, md: 4 }
    }
  }
}));

export default customTheme;
