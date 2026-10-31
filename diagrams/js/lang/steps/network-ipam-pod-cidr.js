// Russian for network-ipam-pod-cidr: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "IPAM and Pod CIDR allocation, where the controller-manager carves a non-overlapping slice of the cluster pod CIDR for each Node, and a CNI IPAM that uses that slice draws every Pod IP it hands out on the Node from it":
    "IPAM и выделение Pod CIDR, где controller-manager вырезает для каждой Node непересекающийся кусок pod CIDR кластера, а CNI IPAM, который опирается на этот кусок, выдаёт из него каждый IP для Pod на этой Node",

  "The cluster pod CIDR is set on the controller-manager with the --cluster-cidr flag. It is the single pool every Node slice is carved from, and on its own it belongs to no Node yet.":
    "Диапазон pod CIDR кластера задают у controller-manager флагом --cluster-cidr. Это единственный пул, из которого вырезается кусок каждой Node, а сам по себе пул ещё не принадлежит ни одной Node.",

  "With --allocate-node-cidrs set, the controller-manager carves a smaller, non-overlapping block out of the pool for every Node and writes it into node.spec.podCIDR. The block size comes from --node-cidr-mask-size, /24 by default, so Node-1 owns 10.244.1.0/24, Node-2 owns 10.244.2.0/24 and Node-3 owns 10.244.3.0/24.":
    "Когда задан флаг --allocate-node-cidrs, controller-manager вырезает из пула для каждой Node меньший непересекающийся блок и записывает его в поле node.spec.podCIDR. Флаг --node-cidr-mask-size задаёт размер блока, по умолчанию /24, так что Node-1 владеет блоком 10.244.1.0/24, Node-2 блоком 10.244.2.0/24, а Node-3 блоком 10.244.3.0/24.",

  "When a Pod is scheduled to Node-1, a CNI IPAM that uses the Node podCIDR draws the Pod address strictly from that slice, 10.244.1.0/24, so the Pod gets 10.244.1.5. Allocation never reaches outside the block a Node owns, which is what stops two Nodes from colliding.":
    "Когда Pod размещают на Node-1, CNI IPAM, который опирается на podCIDR этой Node, берёт адрес для Pod строго из этого куска, 10.244.1.0/24, так что Pod получает 10.244.1.5. Выделение адресов никогда не выходит за блок, которым владеет Node, что и не даёт двум Node конфликтовать.",

  "Every other Node assigns the same way, out of its own slice. A Pod scheduled to Node-2 gets 10.244.2.8 from 10.244.2.0/24, a different /24 that can never overlap the addresses on Node-1. Node-3 holds 10.244.3.0/24 with no Pod scheduled on it yet, because a block is carved at Node registration. So every Pod IP drawn from these blocks is unique across the whole cluster, which is what lets any Pod be reached directly while routing only has to track which Node owns which /24.":
    "Все остальные Node раздают адреса так же, каждая из своего куска. Pod на Node-2 получает 10.244.2.8 из блока 10.244.2.0/24, а это другой /24, который никак не может пересечься с адресами на Node-1. У Node-3 есть блок 10.244.3.0/24, хотя Pod на ней ещё нет. Дело в том, что блок вырезается при регистрации Node. Так что каждый IP Pod из этих блоков уникален во всём кластере, и благодаря этому любой Pod доступен напрямую, а маршрутизации нужно знать только, какой /24 закреплён за какой Node.",
};
