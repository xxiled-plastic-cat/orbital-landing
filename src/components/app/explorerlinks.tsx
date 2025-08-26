interface ExplorerLinksProps {
  appId: number;
}

export const ExplorerLinks: React.FC<ExplorerLinksProps> = ({ appId }) => {
  return (
    <div className="flex space-x-2">
      <a
        href={`https://explorer.perawallet.app/application/${appId}`}
        target="_blank"
        rel="noreferrer "
        className="hover:scale-105"
      >
        <img
          src={"/pera-logo.svg"}
          alt={"Pera Explorer"}
          className="w-7 h-7 p-1 bg-[#FFEE55] rounded-md "
        />
      </a>
      <a
        href={`https://lora.algokit.io/mainnet/application/${appId}`}
        target="_blank"
        rel="noreferrer"
        className="hover:scale-105"
      >
        <img
          src={"/lora-logo.svg"}
          alt={"Lora Explorer"}
          className="w-7 h-7 p-1 bg-[#001424] rounded-md "
        />
      </a>
      <a
        href={`https://allo.info/application/${appId}`}
        target="_blank"
        rel="noreferrer"
        className="hover:scale-105"
      >
        <img
          src={"/allo-logo.svg"}
          alt={"Allo Explorer"}
          className="w-7 h-7 p-1 bg-[#1D3163] rounded-md "
        />
      </a>
    </div>
  );
};
