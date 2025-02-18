// components/Card.jsx

const Card = ({ bgColor, color, borderRadius, children, width, padding }) => {
  return (
    <div
      style={{ 
        backgroundColor: bgColor, 
        color, 
        borderRadius,
        width: width || '100%',
        padding: padding || '1rem'
      }}
      className="shadow-lg hover:drop-shadow-xl"
    >
      {children}
    </div>
  );
};



export default Card; 