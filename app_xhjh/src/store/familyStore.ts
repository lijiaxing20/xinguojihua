import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { familyService, FamilyMember } from '../services/family';

interface FamilyState {
  currentChild: FamilyMember | null;
  familyMembers: FamilyMember[];
  setCurrentChild: (child: FamilyMember | null) => void;
  refreshFamilyMembers: () => Promise<void>;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      currentChild: null,
      familyMembers: [],
      setCurrentChild: (child) => set({ currentChild: child }),
      refreshFamilyMembers: async () => {
        try {
          const res = await familyService.getMembers();
          const childList = res.list.filter(m => m.role === 'child');
          set({ familyMembers: childList });
          
          // 如果当前没有选中孩子，且有孩子列表，默认选中第一个
          const { currentChild } = get();
          if (!currentChild && childList.length > 0) {
            set({ currentChild: childList[0] });
          } else if (currentChild) {
             // 检查当前选中的孩子是否还在列表中
             const exists = childList.find(c => c.user_id === currentChild.user_id);
             if (!exists) {
                 if (childList.length > 0) {
                     set({ currentChild: childList[0] });
                 } else {
                     set({ currentChild: null });
                 }
             } else {
                 // 更新当前孩子的信息，仅当信息发生变化时才更新，避免死循环
                 if (JSON.stringify(exists) !== JSON.stringify(currentChild)) {
                    set({ currentChild: exists });
                 }
             }
          }
        } catch (error) {
          console.error('Failed to refresh family members:', error);
        }
      },
    }),
    {
      name: 'family-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentChild: state.currentChild }), // 只持久化 currentChild，列表每次重新获取或在内存中
    }
  )
);
