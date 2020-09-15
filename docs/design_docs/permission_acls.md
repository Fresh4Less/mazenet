# Design for Permissions and ACLs for Mazenet.

WORK IN PROGRESS

Author: Samuel Davidson

[Typescript API](/common/api/permissions.ts)

Key things it should have

- Hierarchical, if ACLs for an action are not set locally, walk up the inheritance tree (mostly parent rooms) until an ACL is found. The root room should have some default ACL for everything. 
- Room Permissions:
  - Hierarchical, each room has an ACL for permissions 
  - Room-data permissions E.g. who can "edit styles", "edit title"
  - Common element permissions. E.g. Who can create a tunnel, who can 
  - If undefined for an action, walks up the tree of parent rooms.
- Element-unique permissions:
  - These are set per-element. Each element has its own ACL.
  - The permissions within here would be unique to the type of element.
    - E.g. a tunnel element could have a "enter tunnel" element.
    - E.g. a hypothetical "message board" element could have a "write message" permission. 
  - These permissions don't have inhertiance. They are set per-element and don't inherit from anywhere. If they are unset then it should fail open.
  - This ACL should use the same data structure as the room data structure.




Questions:
- Inheritance...
	
