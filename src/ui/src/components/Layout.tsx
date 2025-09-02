import * as React from 'react'
import '../index.css'

interface LayoutProps {
    children: React.ReactNode
    sidebar?: React.ReactNode
}

export default function Layout({ children, sidebar }: LayoutProps) {
    return (
        <main className='layout_grid'>
            {sidebar && (
                <aside className='sidebar'>
                    {sidebar}
                </aside>
            )}
            <div className={sidebar ? 'mainCanvas' : 'mainCanvas-full'}>
                {children}
            </div>
        </main>
    );
}
