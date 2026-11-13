import next from 'eslint-config-next';

const config = [
  ...next,
  { ignores: ['.next/**', 'out/**', 'node_modules/**'] },
  // Las imágenes son data URLs generadas en el cliente: next/image no aporta nada aquí.
  { rules: { '@next/next/no-img-element': 'off' } },
];

export default config;
