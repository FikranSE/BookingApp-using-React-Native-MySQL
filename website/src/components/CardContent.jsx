const CardContent = ({ padding, children }) => {
    return (
      <div className={`p-${padding || '6'}`}>
        {children}
      </div>
    );
  };

export default CardContent;