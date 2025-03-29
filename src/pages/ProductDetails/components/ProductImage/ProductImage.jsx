import "./ProductImage.css";
import Tilt from "react-parallax-tilt";
import React, { useState, useEffect } from "react";

export const ProductImage = ({ selectedProduct }) => {
  const [scale, setScale] = useState(1.15);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScale(1.05);
      } else {
        setScale(1.15);
      }
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <Tilt
      tiltEnable={false}
      scale={scale}
      transitionSpeed={1000}
      className="product-details-image"
    >
      <img 
        src={selectedProduct?.img} 
        alt={selectedProduct?.name || 'Product image'} 
      />
    </Tilt>
  );
};
