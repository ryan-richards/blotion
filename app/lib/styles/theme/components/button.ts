import type { DeepPartial, Theme } from "@chakra-ui/react";

const Button: DeepPartial<Theme["components"]["Button"]> = {
  baseStyle: {
    borderRadius: "md",
  },
};

export default Button;
