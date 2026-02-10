
import { Bookmark, Folder, Tag, DateRange, SortOption, SortOrder } from '../types';
import { INITIAL_BOOKMARKS, INITIAL_FOLDERS, INITIAL_TAGS } from '../constants';

// --- 配置区域 ---
const USE_MOCK_DATA = true; // 当前使用 Mock 数据优先
const API_BASE_URL = 'http://localhost:8080/api';

// --- 接口定义 ---

// 通用响应结构
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 登录接口
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

// 查询参数接口
export interface BookmarkQueryParams {
  folderId?: string;
  tags?: string[];
  search?: string;
  startDate?: string; // ISO String
  endDate?: string;   // ISO String
  sort?: SortOption;
  order?: SortOrder;
}

// --- 模拟数据库 (Mock Database) ---
// 为了模拟持久化，我们在内存中保存一份副本
let mockDb = {
  folders: [...INITIAL_FOLDERS],
  tags: [...INITIAL_TAGS],
  bookmarks: [...INITIAL_BOOKMARKS]
};

// --- Helper: 模拟网络延迟 ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API 服务实现 ---

export const api = {
  // === 认证模块 ===
  auth: {
    login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
      if (USE_MOCK_DATA) {
        await delay(800);
        return {
          success: true,
          data: {
            token: 'mock-jwt-token-123456',
            user: {
              id: 'u1',
              name: 'Demo User',
              email: data.email,
              avatar: 'JD'
            }
          }
        };
      } else {
        // 真实接口调用示例
        /*
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return response.json();
        */
        throw new Error("API not implemented");
      }
    },
    logout: async (): Promise<ApiResponse<void>> => {
      if (USE_MOCK_DATA) {
        await delay(300);
        return { success: true, data: undefined };
      } else {
        /*
        const response = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
        return response.json();
        */
        throw new Error("API not implemented");
      }
    }
  },

  // === 书签模块 ===
  bookmarks: {
    // 获取书签列表 (支持搜索、筛选、排序)
    getAll: async (params?: BookmarkQueryParams): Promise<ApiResponse<Bookmark[]>> => {
      if (USE_MOCK_DATA) {
        await delay(500); // 模拟加载
        let result = [...mockDb.bookmarks];

        // 这里只做简单模拟，真实筛选逻辑通常在后端数据库完成
        // 如果 App.tsx 仍保留前端筛选，这里可以直接返回所有数据
        return { success: true, data: result };
      } else {
        /*
        const query = new URLSearchParams(params as any).toString();
        const response = await fetch(`${API_BASE_URL}/bookmarks?${query}`);
        return response.json();
        */
        throw new Error("API not implemented");
      }
    },

    // 新增书签
    create: async (bookmark: Bookmark): Promise<ApiResponse<Bookmark>> => {
      if (USE_MOCK_DATA) {
        await delay(300);
        mockDb.bookmarks = [bookmark, ...mockDb.bookmarks];
        return { success: true, data: bookmark };
      } else {
        /*
        const response = await fetch(`${API_BASE_URL}/bookmarks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(bookmark)
        });
        return response.json();
        */
        throw new Error("API not implemented");
      }
    },

    // 更新书签 (内容、位置、元数据)
    update: async (id: string, updates: Partial<Bookmark>): Promise<ApiResponse<Bookmark>> => {
      if (USE_MOCK_DATA) {
        await delay(200);
        const index = mockDb.bookmarks.findIndex(b => b.id === id);
        if (index !== -1) {
          mockDb.bookmarks[index] = { ...mockDb.bookmarks[index], ...updates };
          return { success: true, data: mockDb.bookmarks[index] };
        }
        return { success: false, data: null as any, message: 'Not found' };
      } else {
        /*
        const response = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        return response.json();
        */
         throw new Error("API not implemented");
      }
    },

    // 删除书签
    delete: async (id: string): Promise<ApiResponse<string>> => {
      if (USE_MOCK_DATA) {
        await delay(200);
        mockDb.bookmarks = mockDb.bookmarks.filter(b => b.id !== id);
        return { success: true, data: id };
      } else {
        /*
        await fetch(`${API_BASE_URL}/bookmarks/${id}`, { method: 'DELETE' });
        return { success: true, data: id };
        */
         throw new Error("API not implemented");
      }
    },
    
    // 增加访问次数 (用于“经常访问”排序)
    incrementVisit: async (id: string): Promise<ApiResponse<void>> => {
       if (USE_MOCK_DATA) {
           const index = mockDb.bookmarks.findIndex(b => b.id === id);
           if (index !== -1) {
               mockDb.bookmarks[index].visitCount += 1;
               mockDb.bookmarks[index].lastVisited = Date.now();
           }
           return { success: true, data: undefined };
       } else {
           /*
           await fetch(`${API_BASE_URL}/bookmarks/${id}/visit`, { method: 'POST' });
           */
           throw new Error("API not implemented");
       }
    }
  },

  // === 目录模块 ===
  folders: {
    getAll: async (): Promise<ApiResponse<Folder[]>> => {
      if (USE_MOCK_DATA) {
        await delay(300);
        return { success: true, data: mockDb.folders };
      } else {
        /*
        const response = await fetch(`${API_BASE_URL}/folders`);
        return response.json();
        */
         throw new Error("API not implemented");
      }
    },

    create: async (folder: Folder): Promise<ApiResponse<Folder>> => {
      if (USE_MOCK_DATA) {
        await delay(200);
        mockDb.folders = [...mockDb.folders, folder];
        return { success: true, data: folder };
      } else {
        /*
        const response = await fetch(`${API_BASE_URL}/folders`, {
            method: 'POST',
            body: JSON.stringify(folder)
        });
        return response.json();
        */
         throw new Error("API not implemented");
      }
    },

    update: async (id: string, updates: Partial<Folder>): Promise<ApiResponse<Folder>> => {
        if (USE_MOCK_DATA) {
            const index = mockDb.folders.findIndex(f => f.id === id);
            if (index !== -1) {
                mockDb.folders[index] = { ...mockDb.folders[index], ...updates };
                return { success: true, data: mockDb.folders[index] };
            }
            return { success: false, data: null as any };
        } else {
            /*
            const response = await fetch(`${API_BASE_URL}/folders/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
            return response.json();
            */
             throw new Error("API not implemented");
        }
    },

    // 移动目录 (拖拽)
    move: async (id: string, newParentId: string): Promise<ApiResponse<void>> => {
        if (USE_MOCK_DATA) {
            const index = mockDb.folders.findIndex(f => f.id === id);
            if (index !== -1) {
                mockDb.folders[index].parentId = newParentId;
            }
            return { success: true, data: undefined };
        } else {
            /*
             await fetch(`${API_BASE_URL}/folders/${id}/move`, { 
                 method: 'PUT', 
                 body: JSON.stringify({ parentId: newParentId }) 
             });
            */
            throw new Error("API not implemented");
        }
    }
  },

  // === 标签模块 ===
  tags: {
    getAll: async (): Promise<ApiResponse<Tag[]>> => {
      if (USE_MOCK_DATA) {
        await delay(300);
        return { success: true, data: mockDb.tags };
      } else {
        /*
        const response = await fetch(`${API_BASE_URL}/tags`);
        return response.json();
        */
         throw new Error("API not implemented");
      }
    },

    create: async (tag: Tag): Promise<ApiResponse<Tag>> => {
      if (USE_MOCK_DATA) {
        mockDb.tags = [...mockDb.tags, tag];
        return { success: true, data: tag };
      } else {
        /*
        const response = await fetch(`${API_BASE_URL}/tags`, { method: 'POST', body: JSON.stringify(tag) });
        return response.json();
        */
         throw new Error("API not implemented");
      }
    },
    
    // 标签排序/移动
    reorder: async (tags: Tag[]): Promise<ApiResponse<void>> => {
        if (USE_MOCK_DATA) {
            mockDb.tags = tags;
            return { success: true, data: undefined };
        } else {
            /*
            await fetch(`${API_BASE_URL}/tags/reorder`, { method: 'PUT', body: JSON.stringify({ tags }) });
            */
            throw new Error("API not implemented");
        }
    }
  }
};
