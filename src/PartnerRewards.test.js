import React from 'react';
import {render,screen,fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import PartnerRewards from './PartnerRewards';
afterEach(()=>jest.restoreAllMocks());
test('saved banner appears, recovery removes it, and unavailable ends loading',async()=>{
 const body={claims:[],source:'Partner API',asOf:'2026-11-03T07:00:00Z',stale:true};
 global.fetch=jest.fn().mockResolvedValueOnce({ok:true,json:async()=>body}).mockResolvedValueOnce({ok:true,json:async()=>({...body,stale:false})}).mockResolvedValueOnce({ok:false});
 render(<PartnerRewards/>);fireEvent.click(screen.getByRole('button'));
 expect(await screen.findByRole('status')).toHaveTextContent('Showing saved data from');
 fireEvent.click(screen.getByRole('button'));await screen.findByText('No claimed-item rewards found.');expect(screen.queryByRole('status')).toBeNull();
 fireEvent.click(screen.getByRole('button'));expect(await screen.findByRole('alert')).toHaveTextContent('unavailable');expect(screen.getByRole('button')).not.toBeDisabled();
});
