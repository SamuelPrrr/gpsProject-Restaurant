#!/usr/bin/env node

import { updateProductCategories } from './src/scripts/updateProductCategories.js';

console.log('🚀 Ejecutando actualización de categorías de productos...\n');

updateProductCategories()
  .then(() => {
    console.log('\n✨ Actualización completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error durante la actualización:', error);
    process.exit(1);
  });
