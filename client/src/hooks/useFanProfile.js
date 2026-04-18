import { useFan } from '../context/FanContext.jsx';

export function useFanProfile() {
  const { fan, setFanProfile, clearFanProfile } = useFan();
  return { fan, setFanProfile, clearFanProfile };
}
