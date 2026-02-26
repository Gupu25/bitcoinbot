// Añade esta función antes del componente (fuera de NativeBeaconPage)
const getDynamicFee = async (): Promise<number> => {
    try {
        const res = await fetch('https://mempool.space/api/v1/fees/recommended');
        const fees = await res.json();
        return fees.fastestFee || 10; // fallback a 10 si falla
    } catch {
        return 10; // fallback seguro
    }
};

// Luego en createTx, reemplaza:
// const beaconTx = coinbin.buildAndSignBeacon(wallet.wif, utxos, message, 10);
// Por:
const feeRate = await getDynamicFee();
const beaconTx = coinbin.buildAndSignBeacon(wallet.wif, utxos, message, feeRate);