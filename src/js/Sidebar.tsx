import React, { useState } from "react";

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenus, setActiveMenus] = useState<string[]>([]);

  const toggleMenu = (menu: string) => {
    setActiveMenus((prev) => (prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu]));
  };

  return (
    <div className={`${isCollapsed ? "w-16" : "w-64"} h-screen bg-gray-800 text-white transition-all duration-300 flex flex-col`}>
      {/* Toggle Sidebar Button */}
      <button className="p-4 text-lg bg-gray-900 hover:bg-gray-700" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? "➤" : "❮"}
      </button>

      {/* Menu Items */}
      <ul className="flex-1 overflow-y-auto">
        <li>
          <button className="w-full p-4 text-left hover:bg-gray-700 flex items-center" onClick={() => toggleMenu("menu1")}>
            <span className="flex-grow">Menu 1</span>
            {!isCollapsed && <span>{activeMenus.includes("menu1") ? "▲" : "▼"}</span>}
          </button>
          {activeMenus.includes("menu1") && (
            <ul className="pl-4">
              <li className="p-2 hover:bg-gray-700">Submenu 1.1</li>
              <li className="p-2 hover:bg-gray-700">Submenu 1.2</li>
              <li className="p-2 hover:bg-gray-700">Submenu 1.3</li>
            </ul>
          )}
        </li>
        <li>
          <button className="w-full p-4 text-left hover:bg-gray-700 flex items-center" onClick={() => toggleMenu("menu2")}>
            <span className="flex-grow">Menu 2</span>
            {!isCollapsed && <span>{activeMenus.includes("menu2") ? "▲" : "▼"}</span>}
          </button>
          {activeMenus.includes("menu2") && (
            <ul className="pl-4">
              <li className="p-2 hover:bg-gray-700">Submenu 2.1</li>
              <li className="p-2 hover:bg-gray-700">Submenu 2.2</li>
            </ul>
          )}
        </li>
      </ul>

      {/* Footer */}
      <div className="p-4 bg-gray-900">{!isCollapsed && <span>photoTag</span>}</div>
    </div>
  );
};

export default Sidebar;
