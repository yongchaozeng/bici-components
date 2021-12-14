import React, { useEffect, useState, useMemo } from 'react';

const Foo = ({ title }: { title: string }) => {
    const [num, setNum] = useState(0);
  return <h1>789{title}</h1>;
};
export default Foo;
