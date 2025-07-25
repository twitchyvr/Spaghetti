import{c as s,u as h,j as a}from"./index-Ddi5eUMj.js";import{r as x}from"./vendor-DiiPbxpF.js";import{u as m,L as p}from"./router-Cc-_B42c.js";import{F as c,D as j}from"./file-text-BokP3e0I.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=s("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=s("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=s("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=s("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=s("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=s("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);function w({children:d}){const{user:r}=h(),o=m(),[t,i]=x.useState(!1),n=[{id:"dashboard",label:"Dashboard",icon:a.jsx(b,{size:20}),path:"/dashboard"},{id:"documents",label:"Documents",icon:a.jsx(c,{size:20}),path:"/documents"},{id:"database",label:"Database Admin",icon:a.jsx(j,{size:20}),path:"/database",badge:"ADMIN"},{id:"settings",label:"Settings",icon:a.jsx(y,{size:20}),path:"/settings"}],l=e=>o.pathname.startsWith(e);return a.jsxs("div",{className:"app-layout",children:[a.jsxs("aside",{className:`app-sidebar ${t?"open":""}`,children:[a.jsxs("div",{className:"sidebar-header",children:[a.jsxs("div",{className:"sidebar-logo",children:[a.jsx("div",{className:"logo-icon",children:a.jsx(c,{size:24})}),a.jsxs("div",{className:"logo-text",children:[a.jsx("h2",{className:"logo-title",children:"Enterprise Docs"}),a.jsx("p",{className:"logo-subtitle",children:"AI-Powered Platform"})]})]}),a.jsx("button",{className:"sidebar-toggle lg:hidden",onClick:()=>i(!1),children:a.jsx(g,{size:20})})]}),a.jsx("nav",{className:"sidebar-nav",children:n.map(e=>a.jsxs(p,{to:e.path,className:`nav-item ${l(e.path)?"active":""}`,onClick:()=>i(!1),children:[a.jsx("span",{className:"nav-icon",children:e.icon}),a.jsx("span",{className:"nav-label",children:e.label}),e.badge&&a.jsx("span",{className:"nav-badge",children:e.badge}),l(e.path)&&a.jsx(v,{className:"nav-active-indicator",size:16})]},e.id))}),a.jsx("div",{className:"sidebar-footer",children:a.jsxs("div",{className:"user-section",children:[a.jsx("div",{className:"user-avatar",children:a.jsx(N,{size:20})}),a.jsxs("div",{className:"user-info",children:[a.jsx("p",{className:"user-name",children:r?.firstName||"Demo User"}),a.jsx("p",{className:"user-role",children:"Professional"})]})]})})]}),t&&a.jsx("div",{className:"sidebar-overlay lg:hidden",onClick:()=>i(!1)}),a.jsxs("div",{className:"app-main",children:[a.jsx("header",{className:"app-header",children:a.jsxs("div",{className:"header-content",children:[a.jsx("button",{className:"header-menu-btn lg:hidden",onClick:()=>i(!0),children:a.jsx(u,{size:24})}),a.jsx("div",{className:"header-title",children:a.jsx("h1",{className:"page-title",children:n.find(e=>l(e.path))?.label||"Page"})}),a.jsx("div",{className:"header-actions",children:a.jsxs("span",{className:"connection-status",children:[a.jsx("span",{className:"status-dot"}),"Database Connected"]})})]})}),a.jsx("main",{className:"app-content",children:a.jsx("div",{className:"content-container",children:d})})]})]})}export{w as default};
