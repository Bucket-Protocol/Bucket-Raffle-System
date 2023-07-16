import { WalletKitProvider } from '@mysten/wallet-kit';
import * as React from 'react';

import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

import Navbar from '../components/Navbar';
import { RaffleManager } from '../components/RaffleManager';
import { PreviousRaffles } from '../components/PreviousRaffles';
import Script from 'next/script';
import 'flowbite';
/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default function HomePage() {
  return (
    <WalletKitProvider>
      <Layout>
        {/* <Seo templateTitle='Home' /> */}
        <Seo />
        <main>
          <Navbar></Navbar>
          <section>
            <RaffleManager></RaffleManager>
            <PreviousRaffles />
          </section>
        </main>
      </Layout>
    </WalletKitProvider>
  );
}
