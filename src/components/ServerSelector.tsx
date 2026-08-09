import React from 'react';
import { ServerManager, StreamServer } from '../utils/serverResolver';
import { Server, Zap, ShieldCheck } from 'lucide-react';

interface ServerSelectorProps {
  activeServerId: string;
  onSelectServer: (serverId: string) => void;
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({ activeServerId, onSelectServer }) => {
  const servers = ServerManager.getServers();

  return (
    <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[#07151e] border-2 border-black shadow-[4px_4px_0px_#000000]">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#00f2fe]" />
          <span className="text-xs font-black uppercase text-white tracking-wider">
            Streaming Servers
          </span>
        </div>
        <span className="text-[10px] text-[#14b8a6] font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00f2fe]" /> Auto-Fallback Resolver Active
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {servers.map((srv: StreamServer) => {
          const isActive = srv.id === activeServerId;
          return (
            <button
              key={srv.id}
              onClick={() => onSelectServer(srv.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-black ${
                isActive
                  ? 'bg-gradient-to-r from-[#14b8a6] to-[#00f2fe] text-black shadow-[2px_2px_0px_#000000] scale-[1.02]'
                  : 'bg-[#0d2836] text-gray-200 hover:bg-[#14b8a6]/20 shadow-[1px_1px_0px_#000000]'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isActive ? 'text-black fill-black' : 'text-[#00f2fe]'}`} />
              <span>{srv.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold ${
                  isActive ? 'bg-black text-[#00f2fe]' : 'bg-black/50 text-[#14b8a6]'
                }`}
              >
                {srv.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
