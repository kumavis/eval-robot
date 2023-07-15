'use client';
import Image from 'next/image'
import styles from './page.module.css'
import dynamic from 'next/dynamic';

const GamePage = dynamic(() => import('../components/GamePage'), {
  ssr: false,
});

export default function Page() {
  return <GamePage />;
}
