import { useState, ReactNode } from 'react';

export function getCurrentTabsAmount() {
    const tabs = document.querySelectorAll('.page_content');
    return tabs.length - 1;
}

interface TabPageProps {
    children?: ReactNode;
    initialName?: string;
    tabNumber?: number;
    onNameChange?: (newName: string) => void;
    onTabIndexChange?: (newIndex: number) => void;
    minTabIndex?: number;
    maxTabIndex?: number;
}

export default function TabPage({
    children,
    initialName = 'New TabPage',
    tabNumber = 0,
    onNameChange,
    onTabIndexChange,
    minTabIndex = 1,
    maxTabIndex = 99
}: TabPageProps) {
    const [tabName, setTabName] = useState(initialName);
    const [stateTabNumber, setStateTabNumber] = useState(tabNumber);

    const handleNewName = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newName = event.target.value;
        setTabName(newName);
        onNameChange?.(newName);
    };

    const handleNewTabNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newNumber = Number(event.target.value);
        setStateTabNumber(newNumber);
        onTabIndexChange?.(newNumber);
    };

    return (
        <section className='page_content'
         data-tab={tabNumber}
        >
            <strong className='name--light'>{tabName}</strong>
            <details>
                <summary>
                    Attribute
                </summary>
                    <div className='tab-attributes'>
                        <div>
                            <label htmlFor='tabName'>Tab Name</label>
                            <input
                                id='tabName'
                                name='TabName'
                                type="text"
                                placeholder="New TabPage"
                                value={tabName}
                                onChange={handleNewName}
                            />
                        </div>
                        <div>
                            <label htmlFor='tabIndex'>Tab Index (Reihenfolge)</label>
                            <input
                                id='tabIndex'
                                name='TabIndex'
                                type="number"
                                min={minTabIndex}
                                max={maxTabIndex}
                                value={stateTabNumber}
                                onChange={handleNewTabNumber}
                            />
                        </div>
                    </div>
            </details>
            {children}
        </section>
    );
}
