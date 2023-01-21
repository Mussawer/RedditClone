import React, { FC } from 'react'
import Navbar from './Navbar';
import { Wrapper } from './wrapper';

interface LayoutProps {
    variant?: "small" | "regular";
}

const Layout: FC<LayoutProps> = ({  }) => {
  return (
    <Wrapper>
        <Navbar/>
    </Wrapper>
  )
}

export default Layout;