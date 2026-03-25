'use client';
// types/unicef-react-org-chart.d.ts
declare module '@unicef/react-org-chart' {
  import * as React from 'react';

  export interface TreeNode {
    id: string;
    person: {
      id: string;
      avatar: string;
      department: string;
      name: string;
      title: string;
      totalReports: number;
    };
    hasChild: boolean;
    hasParent: boolean;
    children: TreeNode[];
  }

  export interface OrgChartProps {
    tree: TreeNode;
    NodeComponent?: React.ComponentType<{ node: TreeNode }>;
    lineColor?: string;
    lineWidth?: number;
    lineBorderRadius?: number;
    containerClassName?: string;
    downloadImageId?: string;
    downloadPdfId?: string;
    zoom?: boolean;
    pan?: boolean;
  }

  const OrgChart: React.FC<OrgChartProps>;
  export default OrgChart;
}