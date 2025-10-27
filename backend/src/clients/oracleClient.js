import { getArc56ReturnValue, getABIStructFromABITuple } from '@algorandfoundation/algokit-utils/types/app-arc56';
import { AppClient as _AppClient, } from '@algorandfoundation/algokit-utils/types/app-client';
import { AppFactory as _AppFactory } from '@algorandfoundation/algokit-utils/types/app-factory';
export const APP_SPEC = { "name": "oracle", "structs": { "OracleKey": [{ "name": "assetId", "type": "uint64" }], "TokenPrice": [{ "name": "assetId", "type": "uint64" }, { "name": "price", "type": "uint64" }, { "name": "lastUpdated", "type": "uint64" }] }, "methods": [{ "name": "createApplication", "args": [{ "type": "account", "name": "admin" }], "returns": { "type": "void" }, "actions": { "create": ["NoOp"], "call": [] }, "readonly": false, "events": [], "recommendations": {} }, { "name": "addTokenListing", "args": [{ "type": "uint64", "name": "assetId" }, { "type": "uint64", "name": "initialPrice" }], "returns": { "type": "void" }, "actions": { "create": [], "call": ["NoOp"] }, "readonly": false, "events": [], "recommendations": {} }, { "name": "updateTokenPrice", "args": [{ "type": "uint64", "name": "assetId" }, { "type": "uint64", "name": "newPrice" }], "returns": { "type": "void" }, "actions": { "create": [], "call": ["NoOp"] }, "readonly": false, "events": [], "recommendations": {} }, { "name": "getTokenPrice", "args": [{ "type": "uint64", "name": "assetId" }], "returns": { "type": "(uint64,uint64,uint64)", "struct": "TokenPrice" }, "actions": { "create": [], "call": ["NoOp"] }, "readonly": false, "events": [], "recommendations": {} }, { "name": "removeTokenListing", "args": [{ "type": "uint64", "name": "assetId" }], "returns": { "type": "void" }, "actions": { "create": [], "call": ["NoOp"] }, "readonly": false, "events": [], "recommendations": {} }], "arcs": [22, 28], "networks": {}, "state": { "schema": { "global": { "ints": 0, "bytes": 1 }, "local": { "ints": 0, "bytes": 0 } }, "keys": { "global": { "admin_account": { "keyType": "AVMString", "valueType": "address", "key": "YWRtaW5fYWNjb3VudA==" } }, "local": {}, "box": {} }, "maps": { "global": {}, "local": {}, "box": { "token_prices": { "keyType": "OracleKey", "valueType": "TokenPrice", "prefix": "cHJpY2Vz" } } } }, "bareActions": { "create": [], "call": [] }, "sourceInfo": { "approval": { "sourceInfo": [{ "pc": [252], "errorMessage": "Box must have value" }, { "pc": [80, 95, 119, 137, 155], "errorMessage": "OnCompletion is not NoOp" }, { "pc": [159], "errorMessage": "can only call when creating" }, { "pc": [83, 98, 122, 140], "errorMessage": "can only call when not creating" }, { "pc": [187, 215, 262], "errorMessage": "check GlobalState exists" }], "pcOffsetMethod": "none" }, "clear": { "sourceInfo": [], "pcOffsetMethod": "none" } }, "source": { "approval": "I3ByYWdtYSB2ZXJzaW9uIDExCiNwcmFnbWEgdHlwZXRyYWNrIGZhbHNlCgovLyBAYWxnb3JhbmRmb3VuZGF0aW9uL2FsZ29yYW5kLXR5cGVzY3JpcHQvYXJjNC9pbmRleC5kLnRzOjpDb250cmFjdC5hcHByb3ZhbFByb2dyYW0oKSAtPiB1aW50NjQ6Cm1haW46CiAgICBpbnRjYmxvY2sgMSAwCiAgICBieXRlY2Jsb2NrICJhZG1pbl9hY2NvdW50IiAicHJpY2VzIgogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czoxOC0xOQogICAgLy8gQGNvbnRyYWN0KHsgbmFtZTogJ29yYWNsZScsIGF2bVZlcnNpb246IDExIH0pCiAgICAvLyBleHBvcnQgY2xhc3MgT3JhY2xlIGV4dGVuZHMgQ29udHJhY3QgewogICAgdHhuIE51bUFwcEFyZ3MKICAgIGJ6IG1haW5fYWZ0ZXJfaWZfZWxzZUAxMQogICAgcHVzaGJ5dGVzcyAweGRhNTNmZWZlIDB4M2JhZjg4ZDEgMHg4MjgyOWM1ZCAweGFjMTNlMDA0IDB4MjNhYjliNmEgLy8gbWV0aG9kICJjcmVhdGVBcHBsaWNhdGlvbihhY2NvdW50KXZvaWQiLCBtZXRob2QgImFkZFRva2VuTGlzdGluZyh1aW50NjQsdWludDY0KXZvaWQiLCBtZXRob2QgInVwZGF0ZVRva2VuUHJpY2UodWludDY0LHVpbnQ2NCl2b2lkIiwgbWV0aG9kICJnZXRUb2tlblByaWNlKHVpbnQ2NCkodWludDY0LHVpbnQ2NCx1aW50NjQpIiwgbWV0aG9kICJyZW1vdmVUb2tlbkxpc3RpbmcodWludDY0KXZvaWQiCiAgICB0eG5hIEFwcGxpY2F0aW9uQXJncyAwCiAgICBtYXRjaCBtYWluX2NyZWF0ZUFwcGxpY2F0aW9uX3JvdXRlQDMgbWFpbl9hZGRUb2tlbkxpc3Rpbmdfcm91dGVANCBtYWluX3VwZGF0ZVRva2VuUHJpY2Vfcm91dGVANSBtYWluX2dldFRva2VuUHJpY2Vfcm91dGVANiBtYWluX3JlbW92ZVRva2VuTGlzdGluZ19yb3V0ZUA3CgptYWluX2FmdGVyX2lmX2Vsc2VAMTE6CiAgICAvLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjE4LTE5CiAgICAvLyBAY29udHJhY3QoeyBuYW1lOiAnb3JhY2xlJywgYXZtVmVyc2lvbjogMTEgfSkKICAgIC8vIGV4cG9ydCBjbGFzcyBPcmFjbGUgZXh0ZW5kcyBDb250cmFjdCB7CiAgICBpbnRjXzEgLy8gMAogICAgcmV0dXJuCgptYWluX3JlbW92ZVRva2VuTGlzdGluZ19yb3V0ZUA3OgogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czo2NQogICAgLy8gQGFiaW1ldGhvZCh7IGFsbG93QWN0aW9uczogJ05vT3AnIH0pCiAgICB0eG4gT25Db21wbGV0aW9uCiAgICAhCiAgICBhc3NlcnQgLy8gT25Db21wbGV0aW9uIGlzIG5vdCBOb09wCiAgICB0eG4gQXBwbGljYXRpb25JRAogICAgYXNzZXJ0IC8vIGNhbiBvbmx5IGNhbGwgd2hlbiBub3QgY3JlYXRpbmcKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MTgtMTkKICAgIC8vIEBjb250cmFjdCh7IG5hbWU6ICdvcmFjbGUnLCBhdm1WZXJzaW9uOiAxMSB9KQogICAgLy8gZXhwb3J0IGNsYXNzIE9yYWNsZSBleHRlbmRzIENvbnRyYWN0IHsKICAgIHR4bmEgQXBwbGljYXRpb25BcmdzIDEKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NjUKICAgIC8vIEBhYmltZXRob2QoeyBhbGxvd0FjdGlvbnM6ICdOb09wJyB9KQogICAgY2FsbHN1YiByZW1vdmVUb2tlbkxpc3RpbmcKICAgIGludGNfMCAvLyAxCiAgICByZXR1cm4KCm1haW5fZ2V0VG9rZW5QcmljZV9yb3V0ZUA2OgogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czo1OAogICAgLy8gQGFiaW1ldGhvZCh7IGFsbG93QWN0aW9uczogJ05vT3AnIH0pCiAgICB0eG4gT25Db21wbGV0aW9uCiAgICAhCiAgICBhc3NlcnQgLy8gT25Db21wbGV0aW9uIGlzIG5vdCBOb09wCiAgICB0eG4gQXBwbGljYXRpb25JRAogICAgYXNzZXJ0IC8vIGNhbiBvbmx5IGNhbGwgd2hlbiBub3QgY3JlYXRpbmcKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MTgtMTkKICAgIC8vIEBjb250cmFjdCh7IG5hbWU6ICdvcmFjbGUnLCBhdm1WZXJzaW9uOiAxMSB9KQogICAgLy8gZXhwb3J0IGNsYXNzIE9yYWNsZSBleHRlbmRzIENvbnRyYWN0IHsKICAgIHR4bmEgQXBwbGljYXRpb25BcmdzIDEKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NTgKICAgIC8vIEBhYmltZXRob2QoeyBhbGxvd0FjdGlvbnM6ICdOb09wJyB9KQogICAgY2FsbHN1YiBnZXRUb2tlblByaWNlCiAgICBwdXNoYnl0ZXMgMHgxNTFmN2M3NQogICAgc3dhcAogICAgY29uY2F0CiAgICBsb2cKICAgIGludGNfMCAvLyAxCiAgICByZXR1cm4KCm1haW5fdXBkYXRlVG9rZW5QcmljZV9yb3V0ZUA1OgogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czo0MwogICAgLy8gQGFiaW1ldGhvZCh7IGFsbG93QWN0aW9uczogJ05vT3AnIH0pCiAgICB0eG4gT25Db21wbGV0aW9uCiAgICAhCiAgICBhc3NlcnQgLy8gT25Db21wbGV0aW9uIGlzIG5vdCBOb09wCiAgICB0eG4gQXBwbGljYXRpb25JRAogICAgYXNzZXJ0IC8vIGNhbiBvbmx5IGNhbGwgd2hlbiBub3QgY3JlYXRpbmcKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MTgtMTkKICAgIC8vIEBjb250cmFjdCh7IG5hbWU6ICdvcmFjbGUnLCBhdm1WZXJzaW9uOiAxMSB9KQogICAgLy8gZXhwb3J0IGNsYXNzIE9yYWNsZSBleHRlbmRzIENvbnRyYWN0IHsKICAgIHR4bmEgQXBwbGljYXRpb25BcmdzIDEKICAgIHR4bmEgQXBwbGljYXRpb25BcmdzIDIKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NDMKICAgIC8vIEBhYmltZXRob2QoeyBhbGxvd0FjdGlvbnM6ICdOb09wJyB9KQogICAgY2FsbHN1YiB1cGRhdGVUb2tlblByaWNlCiAgICBpbnRjXzAgLy8gMQogICAgcmV0dXJuCgptYWluX2FkZFRva2VuTGlzdGluZ19yb3V0ZUA0OgogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czozMAogICAgLy8gQGFiaW1ldGhvZCh7IGFsbG93QWN0aW9uczogJ05vT3AnIH0pCiAgICB0eG4gT25Db21wbGV0aW9uCiAgICAhCiAgICBhc3NlcnQgLy8gT25Db21wbGV0aW9uIGlzIG5vdCBOb09wCiAgICB0eG4gQXBwbGljYXRpb25JRAogICAgYXNzZXJ0IC8vIGNhbiBvbmx5IGNhbGwgd2hlbiBub3QgY3JlYXRpbmcKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MTgtMTkKICAgIC8vIEBjb250cmFjdCh7IG5hbWU6ICdvcmFjbGUnLCBhdm1WZXJzaW9uOiAxMSB9KQogICAgLy8gZXhwb3J0IGNsYXNzIE9yYWNsZSBleHRlbmRzIENvbnRyYWN0IHsKICAgIHR4bmEgQXBwbGljYXRpb25BcmdzIDEKICAgIHR4bmEgQXBwbGljYXRpb25BcmdzIDIKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MzAKICAgIC8vIEBhYmltZXRob2QoeyBhbGxvd0FjdGlvbnM6ICdOb09wJyB9KQogICAgY2FsbHN1YiBhZGRUb2tlbkxpc3RpbmcKICAgIGludGNfMCAvLyAxCiAgICByZXR1cm4KCm1haW5fY3JlYXRlQXBwbGljYXRpb25fcm91dGVAMzoKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MjUKICAgIC8vIEBhYmltZXRob2QoeyBhbGxvd0FjdGlvbnM6ICdOb09wJywgb25DcmVhdGU6ICdyZXF1aXJlJyB9KQogICAgdHhuIE9uQ29tcGxldGlvbgogICAgIQogICAgYXNzZXJ0IC8vIE9uQ29tcGxldGlvbiBpcyBub3QgTm9PcAogICAgdHhuIEFwcGxpY2F0aW9uSUQKICAgICEKICAgIGFzc2VydCAvLyBjYW4gb25seSBjYWxsIHdoZW4gY3JlYXRpbmcKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MTgtMTkKICAgIC8vIEBjb250cmFjdCh7IG5hbWU6ICdvcmFjbGUnLCBhdm1WZXJzaW9uOiAxMSB9KQogICAgLy8gZXhwb3J0IGNsYXNzIE9yYWNsZSBleHRlbmRzIENvbnRyYWN0IHsKICAgIHR4bmEgQXBwbGljYXRpb25BcmdzIDEKICAgIGJ0b2kKICAgIHR4bmFzIEFjY291bnRzCiAgICAvLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjI1CiAgICAvLyBAYWJpbWV0aG9kKHsgYWxsb3dBY3Rpb25zOiAnTm9PcCcsIG9uQ3JlYXRlOiAncmVxdWlyZScgfSkKICAgIGNhbGxzdWIgY3JlYXRlQXBwbGljYXRpb24KICAgIGludGNfMCAvLyAxCiAgICByZXR1cm4KCgovLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjpPcmFjbGUuY3JlYXRlQXBwbGljYXRpb24oYWRtaW46IGJ5dGVzKSAtPiB2b2lkOgpjcmVhdGVBcHBsaWNhdGlvbjoKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MjUtMjYKICAgIC8vIEBhYmltZXRob2QoeyBhbGxvd0FjdGlvbnM6ICdOb09wJywgb25DcmVhdGU6ICdyZXF1aXJlJyB9KQogICAgLy8gcHVibGljIGNyZWF0ZUFwcGxpY2F0aW9uKGFkbWluOiBBY2NvdW50KTogdm9pZCB7CiAgICBwcm90byAxIDAKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MjMKICAgIC8vIGFkbWluX2FjY291bnQgPSBHbG9iYWxTdGF0ZTxBY2NvdW50PigpCiAgICBieXRlY18wIC8vICJhZG1pbl9hY2NvdW50IgogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czoyNwogICAgLy8gdGhpcy5hZG1pbl9hY2NvdW50LnZhbHVlID0gYWRtaW4KICAgIGZyYW1lX2RpZyAtMQogICAgYXBwX2dsb2JhbF9wdXQKICAgIHJldHN1YgoKCi8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6Ok9yYWNsZS5hZGRUb2tlbkxpc3RpbmcoYXNzZXRJZDogYnl0ZXMsIGluaXRpYWxQcmljZTogYnl0ZXMpIC0+IHZvaWQ6CmFkZFRva2VuTGlzdGluZzoKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MzAtMzEKICAgIC8vIEBhYmltZXRob2QoeyBhbGxvd0FjdGlvbnM6ICdOb09wJyB9KQogICAgLy8gcHVibGljIGFkZFRva2VuTGlzdGluZyhhc3NldElkOiBVaW50TjY0LCBpbml0aWFsUHJpY2U6IFVpbnRONjQpOiB2b2lkIHsKICAgIHByb3RvIDIgMAogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czozMgogICAgLy8gYXNzZXJ0KG9wLlR4bi5zZW5kZXIgPT09IHRoaXMuYWRtaW5fYWNjb3VudC52YWx1ZSkKICAgIHR4biBTZW5kZXIKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MjMKICAgIC8vIGFkbWluX2FjY291bnQgPSBHbG9iYWxTdGF0ZTxBY2NvdW50PigpCiAgICBpbnRjXzEgLy8gMAogICAgYnl0ZWNfMCAvLyAiYWRtaW5fYWNjb3VudCIKICAgIGFwcF9nbG9iYWxfZ2V0X2V4CiAgICBhc3NlcnQgLy8gY2hlY2sgR2xvYmFsU3RhdGUgZXhpc3RzCiAgICAvLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjMyCiAgICAvLyBhc3NlcnQob3AuVHhuLnNlbmRlciA9PT0gdGhpcy5hZG1pbl9hY2NvdW50LnZhbHVlKQogICAgPT0KICAgIGFzc2VydAogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czozNwogICAgLy8gbGFzdFVwZGF0ZWQ6IG5ldyBVaW50TjY0KEdsb2JhbC5sYXRlc3RUaW1lc3RhbXApLAogICAgZ2xvYmFsIExhdGVzdFRpbWVzdGFtcAogICAgaXRvYgogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czozNC0zOAogICAgLy8gY29uc3QgbmV3VG9rZW5QcmljZSA9IG5ldyBUb2tlblByaWNlKHsKICAgIC8vICAgYXNzZXRJZDogYXNzZXRJZCwKICAgIC8vICAgcHJpY2U6IGluaXRpYWxQcmljZSwKICAgIC8vICAgbGFzdFVwZGF0ZWQ6IG5ldyBVaW50TjY0KEdsb2JhbC5sYXRlc3RUaW1lc3RhbXApLAogICAgLy8gfSkKICAgIGZyYW1lX2RpZyAtMgogICAgZnJhbWVfZGlnIC0xCiAgICBjb25jYXQKICAgIHN3YXAKICAgIGNvbmNhdAogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czoyMAogICAgLy8gdG9rZW5fcHJpY2VzID0gQm94TWFwPE9yYWNsZUtleSwgVG9rZW5QcmljZT4oeyBrZXlQcmVmaXg6ICdwcmljZXMnIH0pCiAgICBieXRlY18xIC8vICJwcmljZXMiCiAgICBmcmFtZV9kaWcgLTIKICAgIGNvbmNhdAogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czo0MAogICAgLy8gdGhpcy50b2tlbl9wcmljZXMoa2V5KS52YWx1ZSA9IG5ld1Rva2VuUHJpY2UuY29weSgpCiAgICBzd2FwCiAgICBib3hfcHV0CiAgICByZXRzdWIKCgovLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjpPcmFjbGUudXBkYXRlVG9rZW5QcmljZShhc3NldElkOiBieXRlcywgbmV3UHJpY2U6IGJ5dGVzKSAtPiB2b2lkOgp1cGRhdGVUb2tlblByaWNlOgogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czo0My00NAogICAgLy8gQGFiaW1ldGhvZCh7IGFsbG93QWN0aW9uczogJ05vT3AnIH0pCiAgICAvLyBwdWJsaWMgdXBkYXRlVG9rZW5QcmljZShhc3NldElkOiBVaW50TjY0LCBuZXdQcmljZTogVWludE42NCk6IHZvaWQgewogICAgcHJvdG8gMiAwCiAgICAvLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjQ1CiAgICAvLyBhc3NlcnQob3AuVHhuLnNlbmRlciA9PT0gdGhpcy5hZG1pbl9hY2NvdW50LnZhbHVlKQogICAgdHhuIFNlbmRlcgogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czoyMwogICAgLy8gYWRtaW5fYWNjb3VudCA9IEdsb2JhbFN0YXRlPEFjY291bnQ+KCkKICAgIGludGNfMSAvLyAwCiAgICBieXRlY18wIC8vICJhZG1pbl9hY2NvdW50IgogICAgYXBwX2dsb2JhbF9nZXRfZXgKICAgIGFzc2VydCAvLyBjaGVjayBHbG9iYWxTdGF0ZSBleGlzdHMKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NDUKICAgIC8vIGFzc2VydChvcC5UeG4uc2VuZGVyID09PSB0aGlzLmFkbWluX2FjY291bnQudmFsdWUpCiAgICA9PQogICAgYXNzZXJ0CiAgICAvLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjIwCiAgICAvLyB0b2tlbl9wcmljZXMgPSBCb3hNYXA8T3JhY2xlS2V5LCBUb2tlblByaWNlPih7IGtleVByZWZpeDogJ3ByaWNlcycgfSkKICAgIGJ5dGVjXzEgLy8gInByaWNlcyIKICAgIGZyYW1lX2RpZyAtMgogICAgY29uY2F0CiAgICAvLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjQ4CiAgICAvLyBhc3NlcnQodGhpcy50b2tlbl9wcmljZXMoa2V5KS5leGlzdHMpCiAgICBkdXAKICAgIGJveF9sZW4KICAgIGJ1cnkgMQogICAgYXNzZXJ0CiAgICAvLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjUzCiAgICAvLyBsYXN0VXBkYXRlZDogbmV3IFVpbnRONjQoR2xvYmFsLmxhdGVzdFRpbWVzdGFtcCksCiAgICBnbG9iYWwgTGF0ZXN0VGltZXN0YW1wCiAgICBpdG9iCiAgICAvLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjUwLTU0CiAgICAvLyBjb25zdCBuZXdUb2tlblByaWNlID0gbmV3IFRva2VuUHJpY2UoewogICAgLy8gICBhc3NldElkOiBhc3NldElkLAogICAgLy8gICBwcmljZTogbmV3UHJpY2UsCiAgICAvLyAgIGxhc3RVcGRhdGVkOiBuZXcgVWludE42NChHbG9iYWwubGF0ZXN0VGltZXN0YW1wKSwKICAgIC8vIH0pCiAgICBmcmFtZV9kaWcgLTIKICAgIGZyYW1lX2RpZyAtMQogICAgY29uY2F0CiAgICBzd2FwCiAgICBjb25jYXQKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NTUKICAgIC8vIHRoaXMudG9rZW5fcHJpY2VzKGtleSkudmFsdWUgPSBuZXdUb2tlblByaWNlLmNvcHkoKQogICAgYm94X3B1dAogICAgcmV0c3ViCgoKLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czo6T3JhY2xlLmdldFRva2VuUHJpY2UoYXNzZXRJZDogYnl0ZXMpIC0+IGJ5dGVzOgpnZXRUb2tlblByaWNlOgogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czo1OC01OQogICAgLy8gQGFiaW1ldGhvZCh7IGFsbG93QWN0aW9uczogJ05vT3AnIH0pCiAgICAvLyBwdWJsaWMgZ2V0VG9rZW5QcmljZShhc3NldElkOiBVaW50TjY0KTogVG9rZW5QcmljZSB7CiAgICBwcm90byAxIDEKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MjAKICAgIC8vIHRva2VuX3ByaWNlcyA9IEJveE1hcDxPcmFjbGVLZXksIFRva2VuUHJpY2U+KHsga2V5UHJlZml4OiAncHJpY2VzJyB9KQogICAgYnl0ZWNfMSAvLyAicHJpY2VzIgogICAgZnJhbWVfZGlnIC0xCiAgICBjb25jYXQKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NjEKICAgIC8vIGFzc2VydCh0aGlzLnRva2VuX3ByaWNlcyhrZXkpLmV4aXN0cykKICAgIGR1cAogICAgYm94X2xlbgogICAgYnVyeSAxCiAgICBhc3NlcnQKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NjIKICAgIC8vIHJldHVybiB0aGlzLnRva2VuX3ByaWNlcyhrZXkpLnZhbHVlLmNvcHkoKQogICAgYm94X2dldAogICAgYXNzZXJ0IC8vIEJveCBtdXN0IGhhdmUgdmFsdWUKICAgIHJldHN1YgoKCi8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6Ok9yYWNsZS5yZW1vdmVUb2tlbkxpc3RpbmcoYXNzZXRJZDogYnl0ZXMpIC0+IHZvaWQ6CnJlbW92ZVRva2VuTGlzdGluZzoKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NjUtNjYKICAgIC8vIEBhYmltZXRob2QoeyBhbGxvd0FjdGlvbnM6ICdOb09wJyB9KQogICAgLy8gcHVibGljIHJlbW92ZVRva2VuTGlzdGluZyhhc3NldElkOiBVaW50TjY0KTogdm9pZCB7CiAgICBwcm90byAxIDAKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NjcKICAgIC8vIGFzc2VydChvcC5UeG4uc2VuZGVyID09PSB0aGlzLmFkbWluX2FjY291bnQudmFsdWUpCiAgICB0eG4gU2VuZGVyCiAgICAvLyBzbWFydF9jb250cmFjdHMvT3JhY2xlL29yYWNsZS5hbGdvLnRzOjIzCiAgICAvLyBhZG1pbl9hY2NvdW50ID0gR2xvYmFsU3RhdGU8QWNjb3VudD4oKQogICAgaW50Y18xIC8vIDAKICAgIGJ5dGVjXzAgLy8gImFkbWluX2FjY291bnQiCiAgICBhcHBfZ2xvYmFsX2dldF9leAogICAgYXNzZXJ0IC8vIGNoZWNrIEdsb2JhbFN0YXRlIGV4aXN0cwogICAgLy8gc21hcnRfY29udHJhY3RzL09yYWNsZS9vcmFjbGUuYWxnby50czo2NwogICAgLy8gYXNzZXJ0KG9wLlR4bi5zZW5kZXIgPT09IHRoaXMuYWRtaW5fYWNjb3VudC52YWx1ZSkKICAgID09CiAgICBhc3NlcnQKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6MjAKICAgIC8vIHRva2VuX3ByaWNlcyA9IEJveE1hcDxPcmFjbGVLZXksIFRva2VuUHJpY2U+KHsga2V5UHJlZml4OiAncHJpY2VzJyB9KQogICAgYnl0ZWNfMSAvLyAicHJpY2VzIgogICAgZnJhbWVfZGlnIC0xCiAgICBjb25jYXQKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NzAKICAgIC8vIGFzc2VydCh0aGlzLnRva2VuX3ByaWNlcyhrZXkpLmV4aXN0cykKICAgIGR1cAogICAgYm94X2xlbgogICAgYnVyeSAxCiAgICBhc3NlcnQKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9PcmFjbGUvb3JhY2xlLmFsZ28udHM6NzIKICAgIC8vIHRoaXMudG9rZW5fcHJpY2VzKGtleSkuZGVsZXRlKCkKICAgIGJveF9kZWwKICAgIHBvcAogICAgcmV0c3ViCg==", "clear": "I3ByYWdtYSB2ZXJzaW9uIDExCiNwcmFnbWEgdHlwZXRyYWNrIGZhbHNlCgovLyBAYWxnb3JhbmRmb3VuZGF0aW9uL2FsZ29yYW5kLXR5cGVzY3JpcHQvYmFzZS1jb250cmFjdC5kLnRzOjpCYXNlQ29udHJhY3QuY2xlYXJTdGF0ZVByb2dyYW0oKSAtPiB1aW50NjQ6Cm1haW46CiAgICBwdXNoaW50IDEgLy8gMQogICAgcmV0dXJuCg==" }, "byteCode": { "approval": "CyACAQAmAg1hZG1pbl9hY2NvdW50BnByaWNlczEbQQAqggUE2lP+/gQ7r4jRBIKCnF0ErBPgBAQjq5tqNhoAjgUATQA7ACkAEQACI0MxGRREMRhENhoBiACkIkMxGRREMRhENhoBiACGgAQVH3x1TFCwIkMxGRREMRhENhoBNhoCiABLIkMxGRREMRhENhoBNhoCiAAdIkMxGRREMRgURDYaARfAHIgAAiJDigEAKIv/Z4mKAgAxACMoZUQSRDIHFov+i/9QTFApi/5QTL+JigIAMQAjKGVEEkQpi/5QSb1FAUQyBxaL/ov/UExQv4mKAQEpi/9QSb1FAUS+RImKAQAxACMoZUQSRCmL/1BJvUUBRLxIiQ==", "clear": "C4EBQw==" }, "compilerInfo": { "compiler": "puya", "compilerVersion": { "major": 4, "minor": 7, "patch": 0 } }, "events": [], "templateVariables": {} };
class BinaryStateValue {
    value;
    constructor(value) {
        this.value = value;
    }
    asByteArray() {
        return this.value;
    }
    asString() {
        return this.value !== undefined ? Buffer.from(this.value).toString('utf-8') : undefined;
    }
}
/**
 * Converts the ABI tuple representation of a OracleKey to the struct representation
 */
export function OracleKeyFromTuple(abiTuple) {
    return getABIStructFromABITuple(abiTuple, APP_SPEC.structs.OracleKey, APP_SPEC.structs);
}
/**
 * Converts the ABI tuple representation of a TokenPrice to the struct representation
 */
export function TokenPriceFromTuple(abiTuple) {
    return getABIStructFromABITuple(abiTuple, APP_SPEC.structs.TokenPrice, APP_SPEC.structs);
}
/**
 * Exposes methods for constructing `AppClient` params objects for ABI calls to the Oracle smart contract
 */
export class OracleParamsFactory {
    /**
     * Gets available create ABI call param factories
     */
    static get create() {
        return {
            _resolveByMethod(params) {
                switch (params.method) {
                    case 'createApplication':
                    case 'createApplication(account)void':
                        return OracleParamsFactory.create.createApplication(params);
                }
                throw new Error(`Unknown ' + verb + ' method`);
            },
            /**
             * Constructs create ABI call params for the oracle smart contract using the createApplication(account)void ABI method
             *
             * @param params Parameters for the call
             * @returns An `AppClientMethodCallParams` object for the call
             */
            createApplication(params) {
                return {
                    ...params,
                    method: 'createApplication(account)void',
                    args: Array.isArray(params.args) ? params.args : [params.args.admin],
                };
            },
        };
    }
    /**
     * Constructs a no op call for the addTokenListing(uint64,uint64)void ABI method
     *
     * @param params Parameters for the call
     * @returns An `AppClientMethodCallParams` object for the call
     */
    static addTokenListing(params) {
        return {
            ...params,
            method: 'addTokenListing(uint64,uint64)void',
            args: Array.isArray(params.args) ? params.args : [params.args.assetId, params.args.initialPrice],
        };
    }
    /**
     * Constructs a no op call for the updateTokenPrice(uint64,uint64)void ABI method
     *
     * @param params Parameters for the call
     * @returns An `AppClientMethodCallParams` object for the call
     */
    static updateTokenPrice(params) {
        return {
            ...params,
            method: 'updateTokenPrice(uint64,uint64)void',
            args: Array.isArray(params.args) ? params.args : [params.args.assetId, params.args.newPrice],
        };
    }
    /**
     * Constructs a no op call for the getTokenPrice(uint64)(uint64,uint64,uint64) ABI method
     *
     * @param params Parameters for the call
     * @returns An `AppClientMethodCallParams` object for the call
     */
    static getTokenPrice(params) {
        return {
            ...params,
            method: 'getTokenPrice(uint64)(uint64,uint64,uint64)',
            args: Array.isArray(params.args) ? params.args : [params.args.assetId],
        };
    }
    /**
     * Constructs a no op call for the removeTokenListing(uint64)void ABI method
     *
     * @param params Parameters for the call
     * @returns An `AppClientMethodCallParams` object for the call
     */
    static removeTokenListing(params) {
        return {
            ...params,
            method: 'removeTokenListing(uint64)void',
            args: Array.isArray(params.args) ? params.args : [params.args.assetId],
        };
    }
}
/**
 * A factory to create and deploy one or more instance of the oracle smart contract and to create one or more app clients to interact with those (or other) app instances
 */
export class OracleFactory {
    /**
     * The underlying `AppFactory` for when you want to have more flexibility
     */
    appFactory;
    /**
     * Creates a new instance of `OracleFactory`
     *
     * @param params The parameters to initialise the app factory with
     */
    constructor(params) {
        this.appFactory = new _AppFactory({
            ...params,
            appSpec: APP_SPEC,
        });
    }
    /** The name of the app (from the ARC-32 / ARC-56 app spec or override). */
    get appName() {
        return this.appFactory.appName;
    }
    /** The ARC-56 app spec being used */
    get appSpec() {
        return APP_SPEC;
    }
    /** A reference to the underlying `AlgorandClient` this app factory is using. */
    get algorand() {
        return this.appFactory.algorand;
    }
    /**
     * Returns a new `AppClient` client for an app instance of the given ID.
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    getAppClientById(params) {
        return new OracleClient(this.appFactory.getAppClientById(params));
    }
    /**
     * Returns a new `AppClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     *
     * Automatically populates appName, defaultSender and source maps from the factory
     * if not specified in the params.
     * @param params The parameters to create the app client
     * @returns The `AppClient`
     */
    async getAppClientByCreatorAndName(params) {
        return new OracleClient(await this.appFactory.getAppClientByCreatorAndName(params));
    }
    /**
     * Idempotently deploys the oracle smart contract.
     *
     * @param params The arguments for the contract calls and any additional parameters for the call
     * @returns The deployment result
     */
    async deploy(params = {}) {
        const result = await this.appFactory.deploy({
            ...params,
            createParams: params.createParams?.method ? OracleParamsFactory.create._resolveByMethod(params.createParams) : params.createParams ? params.createParams : undefined,
        });
        return { result: result.result, appClient: new OracleClient(result.appClient) };
    }
    /**
     * Get parameters to create transactions (create and deploy related calls) for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    params = {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the oracle smart contract using the createApplication(account)void ABI method.
             *
             * @param params The params for the smart contract call
             * @returns The create params
             */
            createApplication: (params) => {
                return this.appFactory.params.create(OracleParamsFactory.create.createApplication(params));
            },
        },
    };
    /**
     * Create transactions for the current app
     */
    createTransaction = {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the oracle smart contract using the createApplication(account)void ABI method.
             *
             * @param params The params for the smart contract call
             * @returns The create transaction
             */
            createApplication: (params) => {
                return this.appFactory.createTransaction.create(OracleParamsFactory.create.createApplication(params));
            },
        },
    };
    /**
     * Send calls to the current app
     */
    send = {
        /**
         * Gets available create methods
         */
        create: {
            /**
             * Creates a new instance of the oracle smart contract using an ABI method call using the createApplication(account)void ABI method.
             *
             * @param params The params for the smart contract call
             * @returns The create result
             */
            createApplication: async (params) => {
                const result = await this.appFactory.send.create(OracleParamsFactory.create.createApplication(params));
                return { result: { ...result.result, return: result.result.return }, appClient: new OracleClient(result.appClient) };
            },
        },
    };
}
/**
 * A client to make calls to the oracle smart contract
 */
export class OracleClient {
    /**
     * The underlying `AppClient` for when you want to have more flexibility
     */
    appClient;
    constructor(appClientOrParams) {
        this.appClient = appClientOrParams instanceof _AppClient ? appClientOrParams : new _AppClient({
            ...appClientOrParams,
            appSpec: APP_SPEC,
        });
    }
    /**
     * Checks for decode errors on the given return value and maps the return value to the return type for the given method
     * @returns The typed return value or undefined if there was no value
     */
    decodeReturnValue(method, returnValue) {
        return returnValue !== undefined ? getArc56ReturnValue(returnValue, this.appClient.getABIMethod(method), APP_SPEC.structs) : undefined;
    }
    /**
     * Returns a new `OracleClient` client, resolving the app by creator address and name
     * using AlgoKit app deployment semantics (i.e. looking for the app creation transaction note).
     * @param params The parameters to create the app client
     */
    static async fromCreatorAndName(params) {
        return new OracleClient(await _AppClient.fromCreatorAndName({ ...params, appSpec: APP_SPEC }));
    }
    /**
     * Returns an `OracleClient` instance for the current network based on
     * pre-determined network-specific app IDs specified in the ARC-56 app spec.
     *
     * If no IDs are in the app spec or the network isn't recognised, an error is thrown.
     * @param params The parameters to create the app client
     */
    static async fromNetwork(params) {
        return new OracleClient(await _AppClient.fromNetwork({ ...params, appSpec: APP_SPEC }));
    }
    /** The ID of the app instance this client is linked to. */
    get appId() {
        return this.appClient.appId;
    }
    /** The app address of the app instance this client is linked to. */
    get appAddress() {
        return this.appClient.appAddress;
    }
    /** The name of the app. */
    get appName() {
        return this.appClient.appName;
    }
    /** The ARC-56 app spec being used */
    get appSpec() {
        return this.appClient.appSpec;
    }
    /** A reference to the underlying `AlgorandClient` this app client is using. */
    get algorand() {
        return this.appClient.algorand;
    }
    /**
     * Get parameters to create transactions for the current app. A good mental model for this is that these parameters represent a deferred transaction creation.
     */
    params = {
        /**
         * Makes a clear_state call to an existing instance of the oracle smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params) => {
            return this.appClient.params.bare.clearState(params);
        },
        /**
         * Makes a call to the oracle smart contract using the `addTokenListing(uint64,uint64)void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        addTokenListing: (params) => {
            return this.appClient.params.call(OracleParamsFactory.addTokenListing(params));
        },
        /**
         * Makes a call to the oracle smart contract using the `updateTokenPrice(uint64,uint64)void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        updateTokenPrice: (params) => {
            return this.appClient.params.call(OracleParamsFactory.updateTokenPrice(params));
        },
        /**
         * Makes a call to the oracle smart contract using the `getTokenPrice(uint64)(uint64,uint64,uint64)` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        getTokenPrice: (params) => {
            return this.appClient.params.call(OracleParamsFactory.getTokenPrice(params));
        },
        /**
         * Makes a call to the oracle smart contract using the `removeTokenListing(uint64)void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call params
         */
        removeTokenListing: (params) => {
            return this.appClient.params.call(OracleParamsFactory.removeTokenListing(params));
        },
    };
    /**
     * Create transactions for the current app
     */
    createTransaction = {
        /**
         * Makes a clear_state call to an existing instance of the oracle smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params) => {
            return this.appClient.createTransaction.bare.clearState(params);
        },
        /**
         * Makes a call to the oracle smart contract using the `addTokenListing(uint64,uint64)void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        addTokenListing: (params) => {
            return this.appClient.createTransaction.call(OracleParamsFactory.addTokenListing(params));
        },
        /**
         * Makes a call to the oracle smart contract using the `updateTokenPrice(uint64,uint64)void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        updateTokenPrice: (params) => {
            return this.appClient.createTransaction.call(OracleParamsFactory.updateTokenPrice(params));
        },
        /**
         * Makes a call to the oracle smart contract using the `getTokenPrice(uint64)(uint64,uint64,uint64)` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        getTokenPrice: (params) => {
            return this.appClient.createTransaction.call(OracleParamsFactory.getTokenPrice(params));
        },
        /**
         * Makes a call to the oracle smart contract using the `removeTokenListing(uint64)void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call transaction
         */
        removeTokenListing: (params) => {
            return this.appClient.createTransaction.call(OracleParamsFactory.removeTokenListing(params));
        },
    };
    /**
     * Send calls to the current app
     */
    send = {
        /**
         * Makes a clear_state call to an existing instance of the oracle smart contract.
         *
         * @param params The params for the bare (raw) call
         * @returns The clearState result
         */
        clearState: (params) => {
            return this.appClient.send.bare.clearState(params);
        },
        /**
         * Makes a call to the oracle smart contract using the `addTokenListing(uint64,uint64)void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        addTokenListing: async (params) => {
            const result = await this.appClient.send.call(OracleParamsFactory.addTokenListing(params));
            return { ...result, return: result.return };
        },
        /**
         * Makes a call to the oracle smart contract using the `updateTokenPrice(uint64,uint64)void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        updateTokenPrice: async (params) => {
            const result = await this.appClient.send.call(OracleParamsFactory.updateTokenPrice(params));
            return { ...result, return: result.return };
        },
        /**
         * Makes a call to the oracle smart contract using the `getTokenPrice(uint64)(uint64,uint64,uint64)` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        getTokenPrice: async (params) => {
            const result = await this.appClient.send.call(OracleParamsFactory.getTokenPrice(params));
            return { ...result, return: result.return };
        },
        /**
         * Makes a call to the oracle smart contract using the `removeTokenListing(uint64)void` ABI method.
         *
         * @param params The params for the smart contract call
         * @returns The call result
         */
        removeTokenListing: async (params) => {
            const result = await this.appClient.send.call(OracleParamsFactory.removeTokenListing(params));
            return { ...result, return: result.return };
        },
    };
    /**
     * Clone this app client with different params
     *
     * @param params The params to use for the the cloned app client. Omit a param to keep the original value. Set a param to override the original value. Setting to undefined will clear the original value.
     * @returns A new app client with the altered params
     */
    clone(params) {
        return new OracleClient(this.appClient.clone(params));
    }
    /**
     * Methods to access state for the current oracle app
     */
    state = {
        /**
         * Methods to access global state for the current oracle app
         */
        global: {
            /**
             * Get all current keyed values from global state
             */
            getAll: async () => {
                const result = await this.appClient.state.global.getAll();
                return {
                    adminAccount: result.admin_account,
                };
            },
            /**
             * Get the current value of the admin_account key in global state
             */
            adminAccount: async () => { return (await this.appClient.state.global.getValue("admin_account")); },
        },
        /**
         * Methods to access box state for the current oracle app
         */
        box: {
            /**
             * Get all current keyed values from box state
             */
            getAll: async () => {
                const result = await this.appClient.state.box.getAll();
                return {};
            },
            /**
             * Get values from the token_prices map in box state
             */
            tokenPrices: {
                /**
                 * Get all current values of the token_prices map in box state
                 */
                getMap: async () => { return (await this.appClient.state.box.getMap("token_prices")); },
                /**
                 * Get a current value of the token_prices map by key from box state
                 */
                value: async (key) => { return await this.appClient.state.box.getMapValue("token_prices", key); },
            },
        },
    };
    newGroup() {
        const client = this;
        const composer = this.algorand.newGroup();
        let promiseChain = Promise.resolve();
        const resultMappers = [];
        return {
            /**
             * Add a addTokenListing(uint64,uint64)void method call against the oracle contract
             */
            addTokenListing(params) {
                promiseChain = promiseChain.then(async () => composer.addAppCallMethodCall(await client.params.addTokenListing(params)));
                resultMappers.push(undefined);
                return this;
            },
            /**
             * Add a updateTokenPrice(uint64,uint64)void method call against the oracle contract
             */
            updateTokenPrice(params) {
                promiseChain = promiseChain.then(async () => composer.addAppCallMethodCall(await client.params.updateTokenPrice(params)));
                resultMappers.push(undefined);
                return this;
            },
            /**
             * Add a getTokenPrice(uint64)(uint64,uint64,uint64) method call against the oracle contract
             */
            getTokenPrice(params) {
                promiseChain = promiseChain.then(async () => composer.addAppCallMethodCall(await client.params.getTokenPrice(params)));
                resultMappers.push((v) => client.decodeReturnValue('getTokenPrice(uint64)(uint64,uint64,uint64)', v));
                return this;
            },
            /**
             * Add a removeTokenListing(uint64)void method call against the oracle contract
             */
            removeTokenListing(params) {
                promiseChain = promiseChain.then(async () => composer.addAppCallMethodCall(await client.params.removeTokenListing(params)));
                resultMappers.push(undefined);
                return this;
            },
            /**
             * Add a clear state call to the oracle contract
             */
            clearState(params) {
                promiseChain = promiseChain.then(() => composer.addAppCall(client.params.clearState(params)));
                return this;
            },
            addTransaction(txn, signer) {
                promiseChain = promiseChain.then(() => composer.addTransaction(txn, signer));
                return this;
            },
            async composer() {
                await promiseChain;
                return composer;
            },
            async simulate(options) {
                await promiseChain;
                const result = await (!options ? composer.simulate() : composer.simulate(options));
                return {
                    ...result,
                    returns: result.returns?.map((val, i) => resultMappers[i] !== undefined ? resultMappers[i](val) : val.returnValue)
                };
            },
            async send(params) {
                await promiseChain;
                const result = await composer.send(params);
                return {
                    ...result,
                    returns: result.returns?.map((val, i) => resultMappers[i] !== undefined ? resultMappers[i](val) : val.returnValue)
                };
            }
        };
    }
}
//# sourceMappingURL=oracleClient.js.map