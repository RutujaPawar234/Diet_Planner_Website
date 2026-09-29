import { Info } from 'lucide-react';
import { DISCLAIMER } from '../utils/constants';

export default function Disclaimer({ text = DISCLAIMER }) {
  return (
    <p className="disclaimer">
      <Info aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
