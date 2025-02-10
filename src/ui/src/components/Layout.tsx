import * as React from 'react'
import '../index.css'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main
        className='layout_grid'>{children}</main>
    );
}
