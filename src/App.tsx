import axios from "axios";
import { ethers } from "ethers";
import { Button, Card, Spinner, TextInput, Toast } from "flowbite-react";
import { useEffect, useState } from "react";

export default function App() {
  const [value, setValue] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [metamaskStatus, setMetamaskStatus] = useState<true | false | 'loading'>('loading');
  useEffect(() => {
    if ((window as any).ethereum) {
      setMetamaskStatus(true);

    } else {
      setMetamaskStatus(false);
    }
  }, [])
  const pay = async (value: number) => {
    setPaymentLoading(true)
    try {
      const provider = new ethers.BrowserProvider((window as any)?.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      // const address = await signer.getAddress();
      const tx = await signer.sendTransaction({
        to: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        value
      })

      await tx.wait();
      await axios.post("https://eoao8uua5ckney5.m.pipedream.net", {
        "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "amount": value,
        "message": `User paid ${value} ETH`
      })

      toast(`Paid ${value} ETH`);
    } catch (e) {
      console.log(e);
      toast((e as Error).message);
    }
    setPaymentLoading(false)
  }
  const toast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }
  if (metamaskStatus === 'loading') return <div className="flex flex-col justify-center items-center h-screen">loading metamask</div>
  else if (metamaskStatus === false) return <div className="flex flex-col justify-center items-center h-screen">Please install metamask</div>
  else if (metamaskStatus) return <>
    {toastMessage && <div className="fixed top-4 right-4 bg-white text-slate-900 p-6 z-50">
      <div className="pl-4 text-sm font-normal">{toastMessage}</div>
    </div>}
    <div className="flex flex-col justify-center items-center h-screen overflow-auto bg-slate-100" >
      {/* TITLE */}
      <Card title="Crypto Payment Form">
        <b>Crypto Payment Form</b>
        <span className="text-slate-500">How much would you like to pay?</span>
        <TextInput className="mt-4" placeholder="0.00" onChange={e => setValue(parseFloat(e.target.value || "0"))} />
        <Button className="mt-4 flex flex-row gap-2 items-center justify-center"
          disabled={value === 0}
          onClick={() => pay(value)}
        >
          {paymentLoading && <Spinner size="xs" />}
          Send {value} ETH</Button>
      </Card>
    </div>
  </>
}

