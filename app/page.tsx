"use client";
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { AuthorityType, MINT_SIZE, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createInitializeMintInstruction, createMintToInstruction, getAssociatedTokenAddress, createSetAuthorityInstruction } from "@solana/spl-token";

export default function Home() {
 const { connection } = useConnection();
 const { publicKey, signTransaction } = useWallet();
 const [name,setName]=useState(""); const [symbol,setSymbol]=useState(""); const [decimals,setDecimals]=useState("9"); const [supply,setSupply]=useState("1000000000");
 const [revokeMint,setRevokeMint]=useState(false); const [revokeFreeze,setRevokeFreeze]=useState(false);
 const [busy,setBusy]=useState(false); const [status,setStatus]=useState(""); const [signature,setSignature]=useState(""); const [mintAddress,setMintAddress]=useState("");
 async function createToken() {
  if(!publicKey || !signTransaction) { setStatus("Connect a wallet first."); return; }
  if(!name.trim() || !symbol.trim() || !/^\\d+(\\.\\d+)?$/.test(supply) || Number(supply)<=0) { setStatus("Enter a token name, symbol and a valid positive supply."); return; }
  const d=Number(decimals); if(!Number.isInteger(d)||d<0||d>9){setStatus("Decimals must be between 0 and 9.");return;}
  setBusy(true); setStatus("Preparing your token transaction…"); setSignature(""); setMintAddress("");
  try {
   const mint=Keypair.generate(); const ata=await getAssociatedTokenAddress(mint.publicKey,publicKey);
   const raw=supply.trim(); const parts=raw.split("."); if((parts[1]?.length||0)>d) throw new Error("Supply has more decimal places than the selected token decimals.");
   const amount=BigInt(parts[0])*10n**BigInt(d)+BigInt(((parts[1]||"").padEnd(d,"0"))||"0");
   const rent=await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
   const tx=new Transaction();
   tx.add(SystemProgram.createAccount({fromPubkey:publicKey,newAccountPubkey:mint.publicKey,space:MINT_SIZE,lamports:rent,programId:TOKEN_PROGRAM_ID}));
   tx.add(createInitializeMintInstruction(mint.publicKey,d,publicKey,revokeFreeze?null:publicKey));
   tx.add(createAssociatedTokenAccountInstruction(publicKey,ata,publicKey,mint.publicKey));
   tx.add(createMintToInstruction(mint.publicKey,ata,publicKey,amount));
   if(revokeMint) tx.add(createSetAuthorityInstruction(mint.publicKey,publicKey,AuthorityType.MintTokens,null));
   if(revokeFreeze) tx.add(createSetAuthorityInstruction(mint.publicKey,publicKey,AuthorityType.FreezeAccount,null));
   const latest=await connection.getLatestBlockhash("confirmed"); tx.feePayer=publicKey; tx.recentBlockhash=latest.blockhash; tx.partialSign(mint);
   setStatus("Please approve the transaction in your wallet…");
   const signed=await signTransaction(tx); const sig=await connection.sendRawTransaction(signed.serialize(),{skipPreflight:false,preflightCommitment:"confirmed"});
   setStatus("Waiting for Solana confirmation…"); await connection.confirmTransaction({signature:sig,...latest},"confirmed");
   setSignature(sig); setMintAddress(mint.publicKey.toBase58()); setStatus("Token created successfully on Solana mainnet.");
  } catch(e) { setStatus(e instanceof Error?e.message:"Transaction failed. Check your wallet and try again."); }
  finally { setBusy(false); }
 }
 return <main>
  <nav className="nav"><a className="brand" href="#"><span className="brandmark">◈</span> ORBIT<span>FORGE</span></a><div className="navright"><span className="network"><i/> Solana Mainnet</span><WalletMultiButton/></div></nav>
  <section className="hero"><div className="eyebrow"><span/> NON-CUSTODIAL SOLANA TOKEN STUDIO</div><h1>Forge your token.<br/><em>Own your future.</em></h1><p className="lead">Launch an SPL token directly from your wallet. Transparent transactions, clear authority controls, and no private keys stored.</p><div className="hero-tags"><span>◆ SPL TOKEN</span><span>◆ PHANTOM & SOLFLARE</span><span>◆ YOU SIGN EVERY TX</span></div></section>
  <section className="workspace">
   <div className="formpanel"><div className="panelhead"><div><div className="eyebrow">TOKEN CONFIGURATION</div><h2>Create a new token</h2></div><span className="step">01 / 02</span></div>
    <label>Token name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Orbit Token" maxLength={32}/></label>
    <div className="twocol"><label>Token symbol<input value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} placeholder="e.g. ORB" maxLength={10}/></label><label>Decimals<select value={decimals} onChange={e=>setDecimals(e.target.value)}>{[0,2,4,6,8,9].map(n=><option key={n} value={n}>{n}</option>)}</select></label></div>
    <label>Initial supply<input value={supply} onChange={e=>setSupply(e.target.value)} inputMode="decimal" placeholder="1000000000"/></label>
    <div className="authority"><div className="eyebrow">AUTHORITY SETTINGS</div><p>Choose whether to permanently revoke these permissions after minting. Revocation cannot be undone.</p>
     <label className="check"><input type="checkbox" checked={revokeMint} onChange={e=>setRevokeMint(e.target.checked)}/><span><b>Revoke mint authority</b><small>Prevents creating additional tokens later.</small></span></label>
     <label className="check"><input type="checkbox" checked={revokeFreeze} onChange={e=>setRevokeFreeze(e.target.checked)}/><span><b>Revoke freeze authority</b><small>Prevents freezing token accounts later.</small></span></label>
    </div>
    <button className="create" disabled={busy} onClick={createToken}>{busy?"PROCESSING…":"CONNECT WALLET & CREATE TOKEN"} <span>↗</span></button>
    {!publicKey&&<p className="hint">Connect Phantom or Solflare using the button above to enable token creation.</p>}
    {status&&<div className={signature?"success":"status"}>{status}</div>}
    {signature&&<div className="result"><b>Mint address</b><code>{mintAddress}</code><a target="_blank" rel="noreferrer" href={`https://solscan.io/token/${mintAddress}`}>View token on Solscan ↗</a><a target="_blank" rel="noreferrer" href={`https://solscan.io/tx/${signature}`}>View transaction ↗</a></div>}
    <p className="disclaimer">Transactions use real SOL on Solana mainnet and require network fees. Review every wallet prompt. OrbitForge never asks for or stores your seed phrase or private key.</p>
   </div>
   <aside className="sidepanel"><div className="previewtop"><span className="eyebrow">LIVE PREVIEW</span><span className="live"><i/> READY</span></div><div className="coin">◈</div><h3>{name||"Your Token"}</h3><div className="ticker">{symbol||"TICKER"} <span> SPL TOKEN</span></div><div className="previewstats"><div><small>INITIAL SUPPLY</small><b>{supply||"—"}</b></div><div><small>DECIMALS</small><b>{decimals}</b></div></div><div className="sidefoot"><span>NETWORK</span><b>Solana Mainnet</b></div><div className="sidefoot"><span>WALLET</span><b>{publicKey?publicKey.toBase58().slice(0,4)+"…"+publicKey.toBase58().slice(-4):"Not connected"}</b></div><div className="security"><span>✳</span><p><b>Self-custody by design</b><br/>Your wallet signs transactions. Your keys stay with you.</p></div></aside>
  </section>
  <section className="features"><div><span>01</span><h3>Wallet-first</h3><p>Connect Phantom or Solflare. No account or custody required.</p></div><div><span>02</span><h3>Authority control</h3><p>Choose mint and freeze authority settings during creation.</p></div><div><span>03</span><h3>Transparent fees</h3><p>Network rent and transaction fees are paid directly on Solana.</p></div></section>
  <footer><a className="brand" href="#"><span className="brandmark">◈</span> ORBIT<span>FORGE</span></a><span>Independent community tool · Not affiliated with Solana</span><span>© 2026 ORBITFORGE</span></footer>
 </main>;
}
