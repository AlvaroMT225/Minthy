import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import nesting from "postcss-nesting";

export default {
  plugins: [
    nesting(),
    tailwindcss(),
    autoprefixer(),
  ],
};
