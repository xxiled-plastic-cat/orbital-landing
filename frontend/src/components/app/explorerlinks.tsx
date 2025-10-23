import { useExplorer, EXPLORERS } from '../../context/explorerContext';

interface ExplorerLinksProps {
  appId: number;
}

export const ExplorerLinks: React.FC<ExplorerLinksProps> = ({ appId }) => {
  const { getExplorerUrl, selectedExplorer } = useExplorer();
  const explorer = EXPLORERS[selectedExplorer];

  return (
    <a
      href={getExplorerUrl('application', appId)}
      target="_blank"
      rel="noreferrer"
      className="hover:scale-105 transition-transform"
    >
      <img
        src={explorer.logo}
        alt={`${explorer.name} Explorer`}
        className="w-7 h-7 p-1"
        style={{ backgroundColor: explorer.bgColor }}
      />
    </a>
  );
};
