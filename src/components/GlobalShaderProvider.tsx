import React from 'react';
import { ShaderUpscaler } from '../utils/shaderUpscaler';

export const GlobalShaderProvider: React.FC = () => {
  return (
    <div 
      aria-hidden="true" 
      dangerouslySetInnerHTML={{ __html: ShaderUpscaler.getSvgFilterMarkup() }} 
    />
  );
};
