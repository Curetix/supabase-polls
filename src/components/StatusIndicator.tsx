import React from 'react';
import { Tooltip } from '@chakra-ui/react';
import '../assets/indicator.css';

export default function LiveIndicator({ active }: { active: boolean }) {
  if (active) {
    return (
      <Tooltip label="Realtime Results Active" textTransform="capitalize">
        <div className="blob red" />
      </Tooltip>
    );
  }
  return (
    <Tooltip label="No Realtime Results" textTransform="capitalize">
      <div className="blob-inactive" />
    </Tooltip>
  );
}
