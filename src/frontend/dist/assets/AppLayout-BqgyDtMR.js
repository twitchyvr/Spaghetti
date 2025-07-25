import{c as a,u as o,j as s}from"./index-Dr8MgG8v.js";import{r as h}from"./vendor-DiiPbxpF.js";import{u as x,L as m}from"./router-Cc-_B42c.js";import{F as p,D as j}from"./file-text-BIqnkByG.js";import{a as b,B as u,S as v,b as y}from"./shield-CoNOE7jU.js";import{U as N,A as g}from"./users-DaOYU_Fi.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=a("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=a("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=a("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=a("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=a("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);function M({children:c}){const{user:r}=o(),d=x(),[n,i]=h.useState(!1),l=[{id:"dashboard",label:"Platform Overview",icon:s.jsx(k,{size:20}),path:"/dashboard"},{id:"clients",label:"Client Management",icon:s.jsx(b,{size:20}),path:"/clients",badge:"ADMIN"},{id:"users",label:"User Administration",icon:s.jsx(N,{size:20}),path:"/users",badge:"ADMIN"},{id:"analytics",label:"Platform Analytics",icon:s.jsx(u,{size:20}),path:"/analytics"},{id:"impersonation",label:"User Impersonation",icon:s.jsx(v,{size:20}),path:"/impersonation",badge:"SUPPORT"},{id:"monitoring",label:"System Health",icon:s.jsx(g,{size:20}),path:"/monitoring"},{id:"database",label:"Database Admin",icon:s.jsx(j,{size:20}),path:"/database",badge:"DEV"},{id:"settings",label:"Platform Settings",icon:s.jsx(y,{size:20}),path:"/settings"}],t=e=>d.pathname.startsWith(e);return s.jsxs("div",{className:"app-layout",children:[s.jsxs("aside",{className:`app-sidebar ${n?"open":""}`,children:[s.jsxs("div",{className:"sidebar-header",children:[s.jsxs("div",{className:"sidebar-logo",children:[s.jsx("div",{className:"logo-icon",children:s.jsx(p,{size:24})}),s.jsxs("div",{className:"logo-text",children:[s.jsx("h2",{className:"logo-title",children:"Enterprise Docs"}),s.jsx("p",{className:"logo-subtitle",children:"AI-Powered Platform"})]})]}),s.jsx("button",{className:"sidebar-toggle lg:hidden",onClick:()=>i(!1),children:s.jsx(D,{size:20})})]}),s.jsx("nav",{className:"sidebar-nav",children:l.map(e=>s.jsxs(m,{to:e.path,className:`nav-item ${t(e.path)?"active":""}`,onClick:()=>i(!1),children:[s.jsx("span",{className:"nav-icon",children:e.icon}),s.jsx("span",{className:"nav-label",children:e.label}),e.badge&&s.jsx("span",{className:"nav-badge",children:e.badge}),t(e.path)&&s.jsx(f,{className:"nav-active-indicator",size:16})]},e.id))}),s.jsx("div",{className:"sidebar-footer",children:s.jsxs("div",{className:"user-section",children:[s.jsx("div",{className:"user-avatar",children:s.jsx(A,{size:20})}),s.jsxs("div",{className:"user-info",children:[s.jsx("p",{className:"user-name",children:r?.firstName||"Demo User"}),s.jsx("p",{className:"user-role",children:"Professional"})]})]})})]}),n&&s.jsx("div",{className:"sidebar-overlay lg:hidden",onClick:()=>i(!1)}),s.jsxs("div",{className:"app-main",children:[s.jsx("header",{className:"app-header",children:s.jsxs("div",{className:"header-content",children:[s.jsx("button",{className:"header-menu-btn lg:hidden",onClick:()=>i(!0),children:s.jsx(z,{size:24})}),s.jsx("div",{className:"header-title",children:s.jsx("h1",{className:"page-title",children:l.find(e=>t(e.path))?.label||"Page"})}),s.jsx("div",{className:"header-actions",children:s.jsxs("span",{className:"connection-status",children:[s.jsx("span",{className:"status-dot"}),"Database Connected"]})})]})}),s.jsx("main",{className:"app-content",children:s.jsx("div",{className:"content-container",children:c})})]})]})}export{M as default};
